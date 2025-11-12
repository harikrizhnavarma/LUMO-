import { redirect } from "next/navigation";

const Page = () => {
  redirect("/auth/sign-in");
};

export default Page;
