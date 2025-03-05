import { db } from "@/lib/prisma/db";
import React from "react";
import { auth } from "@/lib/auth/auth";
import { CheckCheck, Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "./components/create-task-dialog";
import Task from "./components/task";
import GenerateEmailDialog from "./components/generate-email-dialog";

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
      <div className="flex items-center justify-between">
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
        <CheckCheck /> Current Tasks
      </h2>
      <div className="mt-6 grid grid-cols-3">
        <div>
          <h3 className="text-xl font-semibold mb-2">TODO</h3>
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
        <div>
          <h3 className="text-xl font-semibold mb-2">IN PROGRESS</h3>
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
        <div>
          <h3 className="text-xl font-semibold mb-2">DONE</h3>
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
      </div>
    </div>
  );
};

export default page;
