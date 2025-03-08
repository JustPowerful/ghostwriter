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
import { addMemberAction } from "@/actions/workspace/member/add-member-action";
import { deleteMemberAction } from "@/actions/workspace/member/delete-member-action";

const Member = ({
  member,
  workspaceId,
  userId,
}: {
  member: { id: string; firstname: string; lastname: string };
  workspaceId: string;
  userId: string;
}) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-md justify-between ">
      <Dialog onOpenChange={setToggle} open={toggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              Do you really want to remove this member?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setToggle(false)} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setLoading(true);
                  await deleteMemberAction({ workspaceId, userId });
                  setToggle(false);
                } catch (error) {
                  console.log(error);
                } finally {
                  setLoading(false);
                }
              }}
              variant="destructive"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span>
          {member.firstname} {member.lastname}
        </span>
      </div>
      <Button onClick={() => setToggle(true)} variant="secondary">
        <Trash />
      </Button>
    </div>
  );
};

const AddMemberDialog = ({
  members,
  workspaceId,
}: {
  members: {
    user: {
      id: string;
      firstname: string;
      lastname: string;
    };
  }[];
  workspaceId: string;
}) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      // get form data
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const response = await addMemberAction({
        workspaceId: workspaceId,
        email: email,
      });
      console.log(response);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <Button onClick={() => setToggle(true)}>
        <Users /> Manage Members
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users /> Manage Members
            </DialogTitle>
            <DialogDescription>
              Add or remove members from this workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="mb-4">
            <div className="grid grid-cols-[12fr_2fr] gap-2">
              <Input placeholder="Search members" name="email" />
              <Button>
                {loading ? <Loader2 className="animate-spin" /> : "Add"}
              </Button>
            </div>
          </form>
          <div>
            <div>
              {members.map((member) => (
                <Member
                  key={member.user.id}
                  member={member.user}
                  workspaceId={workspaceId}
                  userId={member.user.id}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddMemberDialog;
