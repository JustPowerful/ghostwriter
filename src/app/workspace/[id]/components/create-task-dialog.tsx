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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setToggle(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => {
          setToggle(true);
        }}
      >
        <Plus /> Add task
      </Button>

      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a task</DialogTitle>
            <DialogDescription>
              Enter task information below to create a new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <Label>Title</Label>
              <Input placeholder="Task title" name="title" />
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <Label>Description</Label>
              <Textarea placeholder="Task description" name="description" />
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

export default CreateTaskDialog;
