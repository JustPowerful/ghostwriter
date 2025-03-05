"use client";
import React, { useState } from "react";

import funnyImage from "@/assets/ghostwriter_handshake_robot.png";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AtSign, Loader2 } from "lucide-react";
import Image from "next/image";

const GenerateEmailDialog = ({ workspaceId }: { workspaceId: string }) => {
  const [toggle, setToggle] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateEmail() {
    try {
      setLoading(true);
      const response = await fetch(`/api/generateemail`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId: workspaceId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailContent(data.email);
      } else {
        console.error("There was an error generating the email.");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={() => setToggle(true)}>
        {" "}
        <AtSign /> Generate Email
      </Button>
      <Dialog open={toggle} onOpenChange={setToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Generate an automated email for your completed tasks.
            </DialogTitle>
            {!loading && !emailContent && (
              <DialogDescription>
                This will generate an email with a summary of your completed
                tasks for the current week.
              </DialogDescription>
            )}
            {loading && (
              <div className="w-full flex justify-center">
                <Image
                  src={funnyImage}
                  width={200}
                  height={200}
                  alt="an image of ghostwriter handshaking an AI Robot"
                  className="animate-pulse"
                />
              </div>
            )}
          </DialogHeader>

          {emailContent && (
            <div className="mt-6">
              <div className="text-sm font-semibold">Email Content:</div>
              <pre className="mt-2 text-sm whitespace-pre-wrap">
                {emailContent}
              </pre>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={generateEmail} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Generate Email"
              )}
            </Button>
            <Button
              disabled={loading}
              variant="secondary"
              onClick={() => setToggle(false)}
              className="ml-4"
            >
              <span>Cancel</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerateEmailDialog;
