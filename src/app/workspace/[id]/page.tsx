import { db } from "@/lib/prisma/db";
import React from "react";
import { auth } from "@/lib/auth/auth";
import { CheckCheck, ChevronLeft, Layout } from "lucide-react";
import CreateTaskDialog from "./components/create-task-dialog";
import Task from "./components/task";
import GenerateEmailDialog from "./components/generate-email-dialog";
import DragDropZone from "./components/DragDropZone";
import AddMemberDialog from "./components/add-member-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  const owner = await db.workspace.findUnique({
    where: {
      id: id,
      userId: session!.user.id!,
    },
  });
  const member = await db.member.findFirst({
    where: {
      workspaceId: id,
      userId: session!.user.id!,
    },
  });
  if (!owner && !member) {
    return <div>Workspace not found</div>;
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: id,
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
  const members = await db.member.findMany({
    where: {
      workspaceId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          assignments: {
            select: {
              taskId: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants(),
              "hover:bg-zinc-200 hover:text-slate-900"
            )}
          >
            <ChevronLeft /> Back
          </Link>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            {" "}
            <Layout /> {workspace.title}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <CreateTaskDialog workspaceId={workspace.id} />
          <GenerateEmailDialog workspaceId={workspace.id} />
          <AddMemberDialog workspaceId={workspace.id} members={members} />
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
                currentUserId={session!.user.id!}
                workspaceMembers={members}
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
                currentUserId={session!.user.id!}
                workspaceMembers={members}
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
                currentUserId={session!.user.id!}
                workspaceMembers={members}
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
