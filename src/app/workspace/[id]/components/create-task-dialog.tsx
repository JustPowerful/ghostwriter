"use client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

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
import { createTaskAction } from "@/actions/task/create-task-action";

const CreateTaskDialog = ({ workspaceId }: { workspaceId: string }) => {
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setLoading(true);
      await createTaskAction({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        workspaceId: workspaceId,
      });
      setToggle(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setToggle(true)}>
        <Plus className="w-4 h-4 mr-1.5" /> Add task
      </Button>

      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a task</DialogTitle>
            <DialogDescription>
              Enter task information below to create a new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title
              </Label>
              <Input placeholder="Task title" name="title" required />
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </Label>
              <Textarea placeholder="Task description (optional)" name="description" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setToggle(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create task"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;