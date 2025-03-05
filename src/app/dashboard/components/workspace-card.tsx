"use client";
import { Button } from "@/components/ui/button";
import { CheckCheck, Layout, Router, Trash } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteWorkspaceAction } from "@/actions/workspace/delete-workspace-action";
import { useRouter } from "next/navigation";

const WorkspaceCard = ({ id, title }: { id: string; title: string }) => {
  const [toggleDelete, setToggleDelete] = useState(false);
  const router = useRouter();
  return (
    <>
      <Dialog open={toggleDelete} onOpenChange={setToggleDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setToggleDelete(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteWorkspaceAction({ workspaceId: id }).then(() => {
                  setToggleDelete(false);
                });
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-gray-200 p-2 rounded-md">
        <div className="text-xl font-semibold flex items-center gap-2 uppercase mb-2">
          <Layout /> {title}
        </div>
        <div
          className="flex items-center gap-2 flex-wrap grow"
          onClick={() => {
            // navigate using route
            router.push(`/workspace/${id}`);
          }}
        >
          <Button className="flex-grow">
            <CheckCheck /> Manage tasks
          </Button>
          <Button
            className="flex items-center gap-2 flex-wrap grow"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering navigation
              setToggleDelete(true);
            }}
            variant="destructive"
          >
            <Trash /> Delete
          </Button>
        </div>
      </div>
    </>
  );
};

export default WorkspaceCard;
