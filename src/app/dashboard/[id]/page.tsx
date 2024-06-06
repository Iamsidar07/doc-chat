"use client";

import { Message } from "ai";
import { useChat, useCompletion } from "ai/react";
import { useEffect, useState } from "react";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
interface DashboardPageParams {
  params: {
    id: string;
  };
}

export default function DashboardPage({ params }: DashboardPageParams) {
  const [suggestionQuestions, setSuggestionQuestions] = useState<string[]>([]);
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      streamMode: "text",
      onFinish(message) {
        console.log("Finished");
        console.log(message);
      },
      onError(error) {
        console.log("Error", error);
      },
    });
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, { options: { body: { namespace: params.id } } });
  };

  const { complete, completion } = useCompletion({
    streamMode: "text",
    onError(error) {
      console.log("Error", error);
    },
    onFinish(prompt, completion) {
      const parsed = JSON.parse(completion);
      const questions = JSON.parse(parsed).questions;
      console.log({ completion, parsed, questions });
      setSuggestionQuestions(questions);
    },
  });

  useEffect(() => {
    complete("", { body: { namespace: params.id } });
  }, [params.id]);
  console.log(suggestionQuestions);

  const Message = ({ message }: { message: Message }) => {
    return (
      <Markdown
        className={`border p-3 max-w-fit rounded-t-xl ${message.role === "user" ? "ml-auto bg-bg-2 rounded-bl-xl" : "mr-auto rounded-br-xl"}`}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, children, ...props }) {
            return <code {...props}>{children}</code>;
          },
        }}
      >
        {message.content}
      </Markdown>
    );
  };

  return (
    <>
      <h1>Dashboard: {params.id}</h1>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading && <div>Loading...</div>}
      <form onSubmit={submit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          id="input"
        />
        <button type="submit">Submit</button>
      </form>
      {suggestionQuestions?.map((q) => <div key={q}>{q}</div>)}
    </>
  );
}
