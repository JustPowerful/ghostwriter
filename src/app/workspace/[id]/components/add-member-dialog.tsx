"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMemberAction } from "@/actions/workspace/member/add-member-action";
import { deleteMemberAction } from "@/actions/workspace/member/delete-member-action";
import { changeMemberRoleAction } from "@/actions/workspace/member/change-member-role-action";

const Member = ({
  member,
  workspaceId,
  userId,
  currentUserId,
  isOwner,
}: {
  member: {
    id: string;
    user: { id: string; firstname: string; lastname: string };
    role?: "viewer" | "editor" | "commenter" | "admin";
  };
  isOwner?: boolean;
  workspaceId: string;
  currentUserId: string;
  userId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "viewer" | "editor" | "commenter" | "admin"
  >(member.role || "viewer");

  async function onRoleChange(
    nextRole: "viewer" | "editor" | "commenter" | "admin",
  ) {
    try {
      setLoading(true);
      setSelectedRole(nextRole);
      await changeMemberRoleAction({
        workspaceId,
        memberId: member.id,
        role: nextRole,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">
            {member.user.firstname} {member.user.lastname}
          </span>
          {isOwner ? (
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                onRoleChange(
                  value as "viewer" | "editor" | "commenter" | "admin",
                )
              }
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-30">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-slate-500 capitalize">
              {selectedRole}
            </span>
          )}
        </div>
      </div>

      {member.user.id !== currentUserId && (
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-red-500 hover:bg-red-50"
          onClick={async () => {
            try {
              setLoading(true);
              await deleteMemberAction({ workspaceId, userId });
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          aria-label="Remove member"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
};

const AddMemberDialog = ({
  members,
  workspaceId,
  isOwner,
  currentUserId,
}: {
  members: {
    id: string;
    role?: "viewer" | "editor" | "commenter" | "admin";
    user: {
      id: string;
      firstname: string;
      lastname: string;
      assignments: { taskId: string; userId: string }[];
    };
  }[];
  workspaceId: string;
  isOwner: boolean;
  currentUserId: string;
}) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) return;

    try {
      setLoading(true);
      const response = await addMemberAction({
        workspaceId: workspaceId,
        email: email,
      });

      if (!response?.data?.success) {
        setError(response?.data?.message || "Failed to add member");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setToggle(true)}>
        <Users className="w-4 h-4 mr-1.5" /> Manage members
      </Button>

      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users /> Manage Members
            </DialogTitle>
            <DialogDescription>
              Add or remove members from this workspace
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                name="email"
                className="flex-1"
                required
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-200">
              {members.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No members yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.map((member) => (
                    <Member
                      key={member.user.id}
                      currentUserId={currentUserId}
                      member={member}
                      workspaceId={workspaceId}
                      userId={member.user.id}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddMemberDialog;
