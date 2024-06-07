"use client";

import { uploadDocument } from "@/actions/documents";

export default function Page() {
  return (
    <>
      <form action={uploadDocument}>
        <input type="file" accept=".pdf" name="file" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
