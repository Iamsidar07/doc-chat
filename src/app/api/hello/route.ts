// Load the documents
// Split the documents into chunkss
// Store the chunks in a vector store
// Retrieve the chunks from the vector store
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AstraLibArgs } from "@langchain/community/vectorstores/astradb";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { pull } from "langchain/hub"; // Pull Prompt from the git repo
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { createClient } from "@/utils/supabase/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import client from "@/config/s3";
// astraDB
const astraConfig: AstraLibArgs = {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN as string,
  endpoint: process.env.ASTRA_DB_ENDPOINT as string,
  collection: process.env.ASTRA_DB_COLLECTION ?? "hello_rag",
  collectionOptions: {
    vector: {
      dimension: 768,
      metric: "cosine",
    },
  },
  namespace: "default_keyspace",
};

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERENCE_API_KEY as string,
  batchSize: 48,
});

const index = new Index({
  token: process.env.UPSTASH_API_KEY as string,
  url: process.env.UPSTASH_INDEX_URL as string,
});
async function retrieve(question: string) {
  // ----------------------- Retrieval -----------------------
  const vectorStore = new UpstashVectorStore(embeddings, {
    index,
  });

  const docs = await vectorStore.similaritySearch(question, 5);

  console.log(docs);
  // retriever
  const retriever = vectorStore.asRetriever(5);
  // prompt
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY as string,
    model: "gemini-pro",
    temperature: 0,
  });

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });

  const retrievedDocs = await retriever.invoke(question);
  const result = await ragChain.invoke({
    question,
    context: docs.map((doc) => doc.pageContent).join("\n\n"),
  });
  return result;
}
async function ingest(file: File, fileLink?: string) {
  // ----------------------- Indexing -----------------------
  // how do i convert a file into blob?
  // load the documents
  let loader: CheerioWebBaseLoader | PDFLoader;
  if (fileLink) {
    loader = new CheerioWebBaseLoader(fileLink);
  } else {
    const buffer = await file.arrayBuffer();
    console.log(buffer);
    const blob = new Blob([buffer], { type: "application/pdf" });
    loader = new PDFLoader(blob, {
      splitPages: true,
    });
  }
  const docs = await loader.load();
  console.log(docs);

  // split the documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 100,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
  console.log(splitDocs);

  // store the chunks in a vector store
  const vectorStore = await UpstashVectorStore.fromDocuments(
    splitDocs,
    embeddings,
    { index },
  );

  // ----------------------- Indexing -----------------------
}

export const GET = async (req: NextRequest) => {
  // const formData = await req.formData();
  // const file = formData.get("file") as File | null;
  // if (!file) return NextResponse.json({ error: "No file provided" });
  try {
    // await ingest(file);
    // const result = await retrieve("What are Supernova simulations?");
    const supabase = createClient();
    const command = new GetObjectCommand({
      Key: "ffe9d4c1-9772-4d73-9113-96ef484114f2",
      Bucket: "pdf",
    });
    const res = await client.send(command);
    const { data, error } = await supabase.auth.getSession();
    console.log(data.session?.user.id, error);
    return NextResponse.json({
      message: "Hello World",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error });
  }
};
