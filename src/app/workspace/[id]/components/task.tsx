"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BookmarkCheck,
  Edit,
  Loader2,
  User2,
  UserPlus2,
  Users2,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateTaskAction } from "@/actions/task/update-task-action";
import { addAssigneeAction } from "@/actions/task/add-assignee-action";
import { removeAssigneeAction } from "@/actions/task/remove-assignee-action";

const UpdateTaskDialog = ({
  taskId,
  title,
  description,
}: {
  taskId: string;
  title: string;
  description?: string;
}) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(event.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const response = await updateTaskAction({
        taskId,
        title,
        description,
      });
      if (response?.data?.success) {
        setToggle(false);
      } else {
        console.log(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={(event) => {
          event.stopPropagation();
          setToggle(true);
        }}
        variant="secondary"
      >
        <Edit />
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <Label>Title</Label>
              <Input
                placeholder="Task title"
                name="title"
                defaultValue={title}
              />
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Task description"
                name="description"
                defaultValue={description}
              />
            </div>
            <Button className="w-full" type="submit">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Create Task"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MemberAssignLabel = ({
  member,
  taskId,
}: {
  member: any;
  taskId: string;
}) => {
  const [loading, setLoading] = useState(false);

  // Check if the user is assigned to this task
  const isAssigned = member.user.assignments?.some(
    (assignment: any) => assignment.taskId === taskId
  );

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={member.id}>
        {member.user.firstname} {member.user.lastname}
      </label>
      {isAssigned ? (
        <Button
          onClick={async () => {
            try {
              setLoading(true);
              await removeAssigneeAction({
                taskId,
                assigneeId: member.user.id,
              });
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <X />}
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              setLoading(true);
              await addAssigneeAction({
                taskId,
                assigneeId: member.user.id,
              });
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UserPlus2 />
          )}
        </Button>
      )}
    </div>
  );
};

const AssignmentDialog = ({
  workspaceMembers,
  taskId,
}: {
  workspaceMembers: any;
  taskId: string;
}) => {
  const [toggle, setToggle] = useState(false);

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => {
          setToggle(true);
        }}
      >
        <Users2 />
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage assignment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {workspaceMembers.map((member: any) => (
              <MemberAssignLabel
                key={member.id}
                member={member}
                taskId={taskId}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Task = ({
  id,
  title,
  description,
  status,
  workspaceMembers,
  currentUserId, // Add currentUserId prop
}: {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED";
  workspaceMembers: any;
  currentUserId: string; // Add type for the new prop
}) => {
  const [currentStatus, setCurrentStatus] = useState<
    "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
  >(status);
  const router = useRouter();

  // Compute if task has an assigned user
  const isTaskAssigned = workspaceMembers.some((member: any) =>
    member.user.assignments?.some((assignment: any) => assignment.taskId === id)
  );

  console.log(workspaceMembers);
  // Check if current user is assigned to this task
  const isCurrentUserAssigned = workspaceMembers.some(
    (member: any) =>
      member.user.id === currentUserId &&
      member.user.assignments?.some(
        (assignment: any) => assignment.taskId === id
      )
  );

  const handleStatusChange = async (
    value: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
  ) => {
    setCurrentStatus(value);
    await fetch("/api/updateTaskStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newStatus: value }),
    });
    router.refresh();
  };

  return (
    <>
      <div
        className={`bg-white shadow-2xl cursor-grab py-2 px-4 my-2 rounded-md flex flex-col   ${
          isTaskAssigned ? "border border-dashed border-gray-400" : ""
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", id);
        }}
      >
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-1">
            {isCurrentUserAssigned && (
              <span className="text-blue-500">
                <BookmarkCheck />
              </span>
            )}
            {title}
          </div>{" "}
          <div className="flex items-center gap-2">
            <UpdateTaskDialog
              taskId={id}
              title={title}
              description={description!}
            />
            <AssignmentDialog taskId={id} workspaceMembers={workspaceMembers} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          {/* Display the number of assigned members */}
          <div className="bg-zinc-200 text-zinc-600 p-1 rounded-md w-fit flex items-center gap-1">
            <User2 className="w-4 h-4" />
            {
              workspaceMembers.filter((member: any) =>
                member.user.assignments?.some(
                  (assignment: any) => assignment.taskId === id
                )
              ).length
            }{" "}
            assigned
          </div>
          <Select
            value={currentStatus}
            onValueChange={(value) => {
              handleStatusChange(
                value as "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
              );
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo 📝</SelectItem>
              <SelectItem value="INPROGRESS">In Progress 🕒</SelectItem>
              <SelectItem value="DONE">Done ✅</SelectItem>
              <SelectItem value="ARCHIVED">Archived 📖</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default Task;
