import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { App } from "@/components/main";
import { nanoid } from "nanoid";

export default async function AppPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  // Generate a project ID if none exists
  const projectId = nanoid();

  return <App projectId={projectId} />;
}
