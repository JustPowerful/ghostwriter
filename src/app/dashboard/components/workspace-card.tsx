"use client";
import { Button } from "@/components/ui/button";
import { CheckCheck, Layout, Trash } from "lucide-react";
import { useState } from "react";
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete workspace</DialogTitle>
            <DialogDescription>
              This will permanently delete "{title}" and all its tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setToggleDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteWorkspaceAction({ workspaceId: id }).then(() => {
                  setToggleDelete(false);
                  router.refresh();
                });
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
        onClick={() => router.push(`/workspace/${id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Layout className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg truncate max-w-[200px]">
              {title}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setToggleDelete(true);
            }}
            aria-label="Delete workspace"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-left hover:bg-slate-50"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/workspace/${id}`);
          }}
        >
          <CheckCheck className="w-4 h-4" />
          <span>Manage tasks</span>
        </Button>
      </div>
    </>
  );
};

export default WorkspaceCard;