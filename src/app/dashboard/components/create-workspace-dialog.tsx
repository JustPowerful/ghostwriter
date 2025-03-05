"use client";
import { useState } from "react";
import { createWorkspaceAction } from "@/actions/workspace/create-workspace-action";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Table2Icon } from "lucide-react";

const CreateWorkspaceDialog = () => {
  const [ccEmails, setCcEmails] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setLoading(true);
      await createWorkspaceAction({
        title: formData.get("title") as string,
        email: formData.get("email") as string,
        ccEmails: ccEmails,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setToggle(false);
    }
  };

  return (
    <Dialog open={toggle} onOpenChange={setToggle}>
      <DialogTrigger
        className={cn("cursor-pointer", buttonVariants({ variant: "default" }))}
      >
        <Table2Icon /> Create a workspace
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to manage your projects
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label>Workspace Title</Label>
            <Input className="" placeholder="Workspace title" name="title" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Target email</Label>
            <Input
              className=""
              placeholder="john.doe@example.com"
              name="email"
            />
          </div>
          <div className="flex justify-between w-full">
            <Label>CC Emails</Label>
            <Button
              className="w-fit cursor-pointer"
              onClick={() => {
                setCcEmails([...ccEmails, ""]);
              }}
              type="button"
            >
              {" "}
              add cc email{" "}
            </Button>
          </div>

          {ccEmails.map((email, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <Input
                className="mb-2"
                placeholder={`cc email ${index + 1}`}
                value={email}
                onChange={(e) => {
                  const newEmails = [...ccEmails];
                  newEmails[index] = e.target.value;
                  setCcEmails(newEmails);
                }}
              />
            </div>
          ))}
          <Button className="cursor-pointer w-full" type="submit">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Create workspace"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
