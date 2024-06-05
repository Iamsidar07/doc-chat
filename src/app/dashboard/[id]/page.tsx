"use client";

import { useChat, useCompletion } from "ai/react";
import { useEffect, useState } from "react";

interface DashboardPageParams {
  params: {
    id: string;
  };
}

export default function DashboardPage({ params }: DashboardPageParams) {
  const [suggestionQuestions, setSuggestionQuestions] = useState("");
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

  const { complete } = useCompletion({
    streamMode: "text",
    onError(error) {
      console.log("Error", error);
    },
    onFinish(prompt, completion) {
      console.log("Finished", { prompt, completion }, JSON.parse(completion));
      const parsed = JSON.parse(completion);
      const questions = parsed["questions"];
      const questionArr: string[] = [];
      questions?.forEach((question: string) => {
        questionArr.push(question);
      });
      setSuggestionQuestions(completion);
    },
  });

  useEffect(() => {
    complete("", { body: { namespace: params.id } });
  }, [params.id]);

  return (
    <>
      <h1>Dashboard: {params.id}</h1>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
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
      {suggestionQuestions}
    </>
  );
}
