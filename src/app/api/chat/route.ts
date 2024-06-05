import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Message, StreamingTextResponse } from "ai";
import { CohereEmbeddings } from "@langchain/cohere";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";

const condenseQuestionTemplate = `Given the following chat history and a follow up question, If the follow up question references previous parts of the chat rephrase the follow up question to be a standalone question if not use the follow up question as the standalone question.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Question: {question}
Standalone question:`;

const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  condenseQuestionTemplate,
);

const questionTemplate = `You are an AI assistant answering questions about anything from pdf file the context will provide you with the most relevant data from pdf page content. 
if the context is empty, answer it to the best of your ability. If you cannot find the answer user's question in the context, reply with "I'm sorry, I'm only allowed to answer questions related to your pdf file.".

<context>
  {context}
</context>

QUESTION: {question}  
`;

const prompt = PromptTemplate.fromTemplate(questionTemplate);

const formatVercelMessages = (messages: Message[]) => {
  const formattedDialogueTurns = messages.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n\n");
};

export const POST = async (req: NextRequest) => {
  try {
    const { messages, namespace = "default" } = await req.json();

    const previousMessages = messages.slice(0, -1);
    const latestMessage = messages[messages?.length - 1]?.content;

    // google embeddings
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERENCE_API_KEY as string,
      batchSize: 48,
    });

    const chatModel = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY as string,
      model: "gemini-pro",
      temperature: 0,
    });

    const index = new Index({
      token: process.env.UPSTASH_API_KEY as string,
      url: process.env.UPSTASH_INDEX_URL as string,
    });

    const upstashVectorStore = new UpstashVectorStore(embeddings, {
      index,
      namespace,
    });

    const astraRetriever = upstashVectorStore.asRetriever({
      k: 5,
    });

    const chain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt: prompt,
      outputParser: new StringOutputParser(),
    });

    const retrievedDocs = await astraRetriever.invoke(latestMessage);
    console.log("retrievedDocs", retrievedDocs);
    const stream = await chain.stream({
      question: latestMessage,
      context: retrievedDocs,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
