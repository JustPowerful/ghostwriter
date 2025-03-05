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
import { Edit } from "lucide-react";

const Task = ({
  id,
  title,
  description,
  status,
}: {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "INPROGRESS" | "DONE";
}) => {
  const [currentStatus, setCurrentStatus] = useState<
    "TODO" | "INPROGRESS" | "DONE"
  >(status);
  const router = useRouter();

  const handleStatusChange = async (value: "TODO" | "INPROGRESS" | "DONE") => {
    setCurrentStatus(value);
    await fetch("/api/updateTaskStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newStatus: value }),
    });
    router.refresh();
  };

  return (
    <div className="bg-white shadow-xl m-2 p-4 rounded-md flex justify-between items-center">
      <div>{title}</div>{" "}
      <div className="flex items-center gap-2">
        <Select
          value={currentStatus}
          onValueChange={(value) => {
            handleStatusChange(value as "TODO" | "INPROGRESS" | "DONE");
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">TODO</SelectItem>
            <SelectItem value="INPROGRESS">INPROGRESS</SelectItem>
            <SelectItem value="DONE">DONE</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary">
          <Edit />
        </Button>
      </div>
    </div>
  );
};

export default Task;
