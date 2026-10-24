import { Layout } from "lucide-react";
import CreateWorkspaceDialog from "./components/create-workspace-dialog";
import { db } from "@/lib/prisma/db";
import { auth } from "@/lib/auth/auth";
import WorkspaceCard from "./components/workspace-card";
import { headers } from "next/headers";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const workspaces = await db.workspace.findMany({
    where: {
      OR: [
        { userId: session?.user.id! },
        {
          members: {
            some: {
              userId: session?.user.id!,
            },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5" /> Workspaces
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your workspaces and shared spaces. Create a new one to get started.
            </p>
          </div>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Layout className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No workspaces yet
            </h3>
            <p className="text-slate-500 mb-6">
              Create your first workspace to start managing tasks and generating
              emails.
            </p>
            <CreateWorkspaceDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                id={workspace.id}
                title={workspace.title}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default page;
