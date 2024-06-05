"use client";

import { useChat } from "ai/react";

export default function Page() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    data,
    isLoading,
    append,
  } = useChat({
    streamMode: "text",
    onFinish(message) {
      console.log("Finished");
      console.log(message);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  console.log({ messages, error, data, isLoading });

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          id="input"
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
