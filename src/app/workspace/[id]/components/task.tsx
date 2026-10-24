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
  DialogDescription,
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
      const response = await updateTaskAction({ taskId, title, description });
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
        variant="ghost"
        size="icon"
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        onClick={(event) => {
          event.stopPropagation();
          setToggle(true);
        }}
        aria-label="Edit task"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title
              </Label>
              <Input
                placeholder="Task title"
                name="title"
                defaultValue={title}
                required
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </Label>
              <Textarea
                placeholder="Task description (optional)"
                name="description"
                defaultValue={description}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setToggle(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface Assignment {
  taskId: string;
  userId: string;
}

interface WorkspaceMember {
  id: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    assignments: Assignment[];
  };
}

const MemberAssignLabel = ({
  member,
  taskId,
}: {
  member: {
    id: string;
    user: {
      id: string;
      firstname: string;
      lastname: string;
      assignments: Assignment[];
    };
  };
  taskId: string;
}) => {
  const [loading, setLoading] = useState(false);

  const isAssigned = member.user.assignments?.some(
    (assignment) => assignment.taskId === taskId,
  );

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
          <User2 className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <span className="text-sm font-medium text-slate-900">
          {member.user.firstname} {member.user.lastname}
        </span>
      </div>
      {isAssigned ? (
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={async () => {
            try {
              setLoading(true);
              await removeAssigneeAction({ taskId, assigneeId: member.user.id });
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          aria-label="Remove assignee"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={async () => {
            try {
              setLoading(true);
              await addAssigneeAction({ taskId, assigneeId: member.user.id });
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          aria-label="Add assignee"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus2 className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
};

const AssignmentDialog = ({
  workspaceMembers,
  taskId,
}: {
  workspaceMembers: WorkspaceMember[];
  taskId: string;
}) => {
  const [toggle, setToggle] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        onClick={() => setToggle(true)}
        aria-label="Manage assignees"
      >
        <Users2 className="w-4 h-4" />
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage assignees</DialogTitle>
            <DialogDescription>
              Click to add or remove team members from this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 mt-2">
            {workspaceMembers.map((member) => (
              <MemberAssignLabel key={member.id} member={member} taskId={taskId} />
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
  currentUserId,
}: {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED";
  workspaceMembers: WorkspaceMember[];
  currentUserId: string;
}) => {
  const [currentStatus, setCurrentStatus] = useState<
    "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
  >(status);
  const router = useRouter();

  const isCurrentUserAssigned = workspaceMembers.some(
    (member) =>
      member.user.id === currentUserId &&
      member.user.assignments?.some((assignment) => assignment.taskId === id),
  );

  const assignedMembers = workspaceMembers.filter((member) =>
    member.user.assignments?.some((assignment) => assignment.taskId === id),
  );

  const handleStatusChange = async (
    value: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED",
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
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", id);
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isCurrentUserAssigned && (
            <BookmarkCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
          )}
          <h4 className="font-medium text-slate-900 truncate">{title}</h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <UpdateTaskDialog taskId={id} title={title} description={description ?? ""} />
          <AssignmentDialog taskId={id} workspaceMembers={workspaceMembers} />
        </div>
      </div>

      {description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {assignedMembers.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
              <User2 className="w-3 h-3" />
              {assignedMembers.length} assigned
            </span>
          )}
        </div>
        <Select
          value={currentStatus}
          onValueChange={(value) => {
            handleStatusChange(
              value as "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED",
            );
          }}
        >
          <SelectTrigger className="w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent side="bottom" align="end">
            <SelectItem value="TODO">📝 Todo</SelectItem>
            <SelectItem value="INPROGRESS">🕒 In Progress</SelectItem>
            <SelectItem value="DONE">✅ Done</SelectItem>
            <SelectItem value="ARCHIVED">📖 Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Task;