import { Layout, Skull } from "lucide-react";
import CreateWorkspaceDialog from "./components/create-workspace-dialog";
import { db } from "@/lib/prisma/db";
import { auth } from "@/lib/auth/auth";
import WorkspaceCard from "./components/workspace-card";

const page = async () => {
  const session = await auth();
  const workspaces = await db.workspace.findMany({
    where: {
      userId: session?.user.id!,
    },
  });
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {" "}
          <Skull className="w-8 h-8" /> Dashboard{" "}
        </h1>
        <CreateWorkspaceDialog />
      </div>
      <div className="p-6">
        <h2 className="text-xl flex items-center gap-2 font-semibold">
          <Layout /> Workspaces
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Here are the workspaces you have created. You can create a new
          workspace by clicking the button above.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              id={workspace.id}
              title={workspace.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
