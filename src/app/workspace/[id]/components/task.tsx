"use client";
import React, { useEffect, useState } from "react";
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
  MessageCircle,
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
import { addCommentAction } from "@/actions/task/add-comment-action";

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
              <Button
                type="button"
                variant="outline"
                onClick={() => setToggle(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
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
  role?: "viewer" | "editor" | "commenter" | "admin";
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
          disabled={loading}
          aria-label="Remove assignee"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
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
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus2 className="w-4 h-4" />
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

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
  };
}

const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex gap-2 py-2 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
        <User2 className="w-3.5 h-3.5 text-slate-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-900 font-medium">
          {comment.user.firstname} {comment.user.lastname}
        </p>
        <p className="text-sm text-slate-600">{comment.content}</p>
        <span className="text-xs text-slate-400">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const AddCommentDialog = ({
  taskId,
  canComment,
}: {
  taskId: string;
  canComment: boolean;
}) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setLoading(true);
      const response = await addCommentAction({ taskId, content });
      if (response?.data?.success) {
        setContent("");
        setToggle(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        className={`text-slate-400 hover:text-slate-600 hover:bg-slate-100 ${canComment ? "" : "cursor-not-allowed opacity-50"}`}
        onClick={() => setToggle(true)}
        disabled={!canComment}
        aria-label="Add comment"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add comment</DialogTitle>
          </DialogHeader>
          {!canComment && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-sm text-amber-800">
                You don&apos;t have permission to add comments to tasks.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {canComment && (
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Comment
                </Label>
                <Textarea
                  placeholder="Write a comment..."
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setToggle(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add comment"
                )}
              </Button>
            </div>
          </form>
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
  userRole,
}: {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED";
  workspaceMembers: WorkspaceMember[];
  currentUserId: string;
  userRole: "viewer" | "editor" | "commenter" | "admin";
}) => {
  const [currentStatus, setCurrentStatus] = useState<
    "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
  >(status);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const router = useRouter();

  // Compute current user's role from workspaceMembers if not passed
  const currentUserMember = workspaceMembers.find(
    (member) => member.user.id === currentUserId,
  );
  const effectiveRole = userRole || currentUserMember?.role || "viewer";

  const isCurrentUserAssigned = workspaceMembers.some(
    (member) =>
      member.user.id === currentUserId &&
      member.user.assignments?.some((assignment) => assignment.taskId === id),
  );

  const assignedMembers = workspaceMembers.filter((member) =>
    member.user.assignments?.some((assignment) => assignment.taskId === id),
  );

  const canEdit = ["editor", "admin"].includes(effectiveRole);
  const canMove = ["editor", "admin"].includes(effectiveRole);
  const canComment = ["commenter", "editor", "admin"].includes(effectiveRole);

  useEffect(() => {
    void (async function () {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/tasks/${id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setCommentsLoading(false);
      }
    })();
  }, [id]);

  const handleStatusChange = async (
    value: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED",
  ) => {
    if (!canMove) return;
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
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-shadow ${
        canMove ? "hover:shadow-md cursor-grab" : "cursor-default"
      }`}
      draggable={canMove}
      onDragStart={(e) => {
        if (canMove) {
          e.dataTransfer.setData("taskId", id);
        }
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
          {canEdit && (
            <UpdateTaskDialog
              taskId={id}
              title={title}
              description={description ?? ""}
            />
          )}
          {!canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 cursor-not-allowed opacity-50"
              aria-label="Edit task (viewer)"
              disabled
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canMove && (
            <AssignmentDialog taskId={id} workspaceMembers={workspaceMembers} />
          )}
          {!canMove && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 cursor-not-allowed opacity-50"
              aria-label="Manage assignees (viewer)"
              disabled
            >
              <Users2 className="w-4 h-4" />
            </Button>
          )}
          <AddCommentDialog taskId={id} canComment={canComment} />
        </div>
      </div>

      {description && (
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <h5 className="text-sm font-medium text-slate-900">Comments</h5>
        </div>
        {commentsLoading ? (
          <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
            No comments yet
          </div>
        ) : (
          <div className="space-y-0 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

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
          disabled={!canMove}
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
