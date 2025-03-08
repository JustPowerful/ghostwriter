import { db } from "@/lib/prisma/db";
import React from "react";
import { auth } from "@/lib/auth/auth";
import { CheckCheck, Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "./components/create-task-dialog";
import Task from "./components/task";
import GenerateEmailDialog from "./components/generate-email-dialog";
import DragDropZone from "./components/DragDropZone";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  const workspace = await db.workspace.findUnique({
    where: {
      id: id,
      userId: session!.user.id!,
    },
  });
  if (!workspace) {
    return <div>Workspace not found</div>;
  }
  const tasksTodo = await db.tasks.findMany({
    where: {
      workspaceId: id,
      status: "TODO",
    },
  });
  const tasksInProgress = await db.tasks.findMany({
    where: {
      workspaceId: id,
      status: "INPROGRESS",
    },
  });
  const tasksDone = await db.tasks.findMany({
    where: {
      workspaceId: id,
      status: "DONE",
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          {" "}
          <Layout /> {workspace.title}
        </h1>
        <div className="flex gap-2 items-center">
          <CreateTaskDialog workspaceId={workspace.id} />
          <GenerateEmailDialog workspaceId={workspace.id} />
        </div>
      </div>
      <h2 className="text-2xl font-semibold flex items-center gap-2 mt-6">
        <CheckCheck /> Tasks
      </h2>
      <p>
        You can drag and drop tasks between the columns. Click on a task to edit
        it.
      </p>
      <div className="mt-6 grid grid-cols-3">
        <DragDropZone newStatus="TODO">
          <div className="px-5 py-2 rounded-xl bg-zinc-200 m-2">
            <h3 className="text-xl font-semibold mb-2">Todo / Backlog 📝</h3>
            {tasksTodo.map((task) => (
              <Task
                key={task.id}
                title={task.title}
                description={task.description}
                id={task.id}
                status={task.status}
              />
            ))}
          </div>
        </DragDropZone>
        <DragDropZone newStatus="INPROGRESS">
          <div className="px-5 py-2 rounded-xl bg-zinc-200 m-2">
            <h3 className="text-xl font-semibold mb-2">In Progress 🕒</h3>
            {tasksInProgress.map((task) => (
              <Task
                key={task.id}
                title={task.title}
                description={task.description}
                id={task.id}
                status={task.status}
              />
            ))}
          </div>
        </DragDropZone>
        <DragDropZone newStatus="DONE">
          <div className="px-5 py-2 rounded-xl bg-zinc-200 m-2">
            <h3 className="text-xl font-semibold mb-2">Done ✅</h3>
            {tasksDone.map((task) => (
              <Task
                key={task.id}
                title={task.title}
                description={task.description}
                id={task.id}
                status={task.status}
              />
            ))}
          </div>
        </DragDropZone>
      </div>
    </div>
  );
};

export default page;
