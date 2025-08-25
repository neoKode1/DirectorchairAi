import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { nanoid } from "nanoid";
import { AppClientWrapper } from "@/components/app-client-wrapper";
import { Loading } from "@/components/loading";

export default async function AppPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  // Generate a project ID if none exists
  const projectId = nanoid();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Suspense fallback={<Loading />}>
        <AppClientWrapper projectId={projectId} />
      </Suspense>
    </div>
  );
}
