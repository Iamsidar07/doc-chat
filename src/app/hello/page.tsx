import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  // const { data, error } = await supabase
  //   .from("user")
  //   .insert([
  //     {
  //       name: "test",
  //       email: "test@test.com",
  //       profile_picture: "some image url",
  //     },
  //   ])
  //   .select();
  // console.log(data, error);

  return <div>{JSON.stringify(user)}</div>;
}
