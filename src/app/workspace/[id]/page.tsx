import { db } from "@/lib/prisma/db";
import React from "react";
import { auth } from "@/lib/auth/auth";
import { CheckCheck, ChevronLeft, Layout } from "lucide-react";
import CreateTaskDialog from "./components/create-task-dialog";
import Task from "./components/task";
import GenerateEmailDialog from "./components/generate-email-dialog";
import DragDropZone from "./components/DragDropZone";
import AddMemberDialog from "./components/add-member-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { headers } from "next/headers";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

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
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Workspace not found</div>;
  }

  const workspace = await db.workspace.findUnique({
    where: { id: id },
  });

  if (!workspace) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Workspace not found</div>;
  }

  const tasksTodo = await db.tasks.findMany({
    where: { workspaceId: id, status: "TODO" },
    orderBy: { createdAt: "desc" },
  });
  const tasksInProgress = await db.tasks.findMany({
    where: { workspaceId: id, status: "INPROGRESS" },
    orderBy: { createdAt: "desc" },
  });
  const tasksDone = await db.tasks.findMany({
    where: { workspaceId: id, status: "DONE" },
    orderBy: { createdAt: "desc" },
  });

  const members = await db.member.findMany({
    where: { workspaceId: id },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          assignments: {
            select: { taskId: true, userId: true },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Link>
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5" /> {workspace.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CreateTaskDialog workspaceId={workspace.id} />
            <GenerateEmailDialog workspaceId={workspace.id} />
            <AddMemberDialog workspaceId={workspace.id} members={members} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <CheckCheck className="w-5 h-5" /> Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop tasks between columns. Click a task to edit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Column
            title="Todo"
            icon="📝"
            tasks={tasksTodo}
            status="TODO"
            members={members}
            currentUserId={session!.user.id!}
          />
          <Column
            title="In Progress"
            icon="🕒"
            tasks={tasksInProgress}
            status="INPROGRESS"
            members={members}
            currentUserId={session!.user.id!}
          />
          <Column
            title="Done"
            icon="✅"
            tasks={tasksDone}
            status="DONE"
            members={members}
            currentUserId={session!.user.id!}
          />
        </div>
      </main>
    </div>
  );
};

interface ColumnProps {
  title: string;
  icon: string;
  tasks: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
  }[];
  status: string;
  members: {
    id: string;
    user: {
      id: string;
      firstname: string;
      lastname: string;
      assignments: { taskId: string; userId: string }[];
    };
  }[];
  currentUserId: string;
}

const Column = ({ title, icon, tasks, status, members, currentUserId }: ColumnProps) => {
  return (
    <DragDropZone newStatus={status as "TODO" | "INPROGRESS" | "DONE"}>
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-base">{icon}</span> {title}
            </h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              No tasks yet. Click "Add task" to create one.
            </div>
          ) : (
            tasks.map((task) => (
              <Task
                key={task.id}
                currentUserId={currentUserId}
                workspaceMembers={members}
                title={task.title}
                description={task.description}
                id={task.id}
                status={task.status as "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"}
              />
            ))
          )}
        </div>
      </div>
    </DragDropZone>
  );
};

export default page;