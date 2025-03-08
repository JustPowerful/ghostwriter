"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type DragDropZoneProps = {
  newStatus: "TODO" | "INPROGRESS" | "DONE" | "ARCHIVED";
  children: React.ReactNode;
};

const DragDropZone: React.FC<DragDropZoneProps> = ({ newStatus, children }) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    await fetch("/api/updateTaskStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, newStatus }),
    });
    router.refresh();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative transition-all duration-200"
    >
      {isDraggedOver && (
        <div className="absolute inset-0 bg-slate-400 opacity-50 rounded-md pointer-events-none transition-all duration-200" />
      )}
      {children}
    </div>
  );
};

export default DragDropZone;
