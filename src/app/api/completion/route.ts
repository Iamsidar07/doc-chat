import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { CohereEmbeddings } from "@langchain/cohere";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

export const POST = async (req: NextRequest) => {
  try {
    let docContext = "";
    const namespace = "somekindofnamespace";

    try {
      const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERENCE_API_KEY as string,
        batchSize: 48,
      });
      const index = new Index({
        token: process.env.UPSTASH_API_KEY as string,
        url: process.env.UPSTASH_INDEX_URL as string,
      });

      const vectorStore = new UpstashVectorStore(embeddings, {
        index,
        namespace,
      });
      const docs = await vectorStore.similaritySearch("", 5);
      docContext = docs.map((doc) => doc.pageContent).join("\n\n");
    } catch (error) {
      console.log("Error querying db", error);
      throw new Error("Error querying db");
    }

    const model = genAi.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      generationConfig: {
        temperature: 1,
      },
    });

    const prompt = `You are an assistant who creates sample questions to ask a chatbot.
          Given the context below of the pdf content come up with 4 suggested questions.
          keep them to less than 12 words each.
          Do not label which page the question is for/from

          START CONTEXT
          ${docContext}
          END CONTEXT`;
    const response = await chat.sendMessage(prompt);
    return NextResponse.json(response.response.text());
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
