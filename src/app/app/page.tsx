import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Suspense } from "react";
// import { AppClientWrapper } from "@/components/app-client-wrapper"; // Removed - component deleted
import { Loading } from "@/components/loading";

export default async function AppPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Suspense fallback={<Loading />}>
        {/* <AppClientWrapper projectId={projectId} /> Removed - component deleted */}
        <div className="text-center py-8">
          <p>App Client Wrapper component has been removed during cleanup.</p>
          <p>This page is no longer functional.</p>
        </div>
      </Suspense>
    </div>
  );
}
