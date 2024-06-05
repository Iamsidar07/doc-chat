"use server";

import { redirect } from "next/navigation";

export const uploadDocument = async (formData: FormData) => {
  try {
    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error("Something went wrong");
    }
    if (data) {
      const { namespace } = data;
      redirect(`/dashboard/${namespace}`);
    }
    return res.json();
  } catch (error) {
    throw error;
  }
};
