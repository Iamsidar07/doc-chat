"use client";
import { loginWithGoogle } from "@/app/(auth)/login/actions";

const ContinueWithGoogle = () => {
  return (
    <form action={loginWithGoogle}>
      <button type="submit">Continue with Google</button>
    </form>
  );
};

export default ContinueWithGoogle;
