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
import { Edit, Loader2, Text } from "lucide-react";

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

const Task = ({
  id,
  title,
  description,
  status,
}: {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED";
}) => {
  const [currentStatus, setCurrentStatus] = useState<
    "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED"
  >(status);
  const router = useRouter();

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
        className="bg-white shadow-2xl cursor-grab  py-2 px-4 my-2 rounded-md flex justify-between items-center"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", id);
        }}
      >
        <div>{title}</div>{" "}
        <div className="flex items-center gap-2">
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
          <UpdateTaskDialog
            taskId={id}
            title={title}
            description={description!}
          />
        </div>
      </div>
    </>
  );
};

export default Task;
