"use client";
import React, { useState, useRef, useEffect } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamRef = useRef<ReadableStream | null>(null);

  // This ensures we clean up any ongoing stream when unmounting
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  async function generateEmail() {
    try {
      // Reset state
      setLoading(true);
      setEmailContent("");

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      console.log("Starting email generation...");
      const response = await fetch(`/api/generateemail`, {
        method: "POST",
        body: JSON.stringify({ workspaceId }),
        signal: abortControllerRef.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response doesn't have a body");
      }

      // Store the stream for potential cleanup
      streamRef.current = response.body;

      // Use the stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Start reading and processing immediately
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const text = decoder.decode(result.value, { stream: !done });
          // Update the state with new content
          setEmailContent((currentContent) => currentContent + text);
        }
      }
    } catch (error) {
      console.error("Error generating email:", error);
      setEmailContent(
        (prev) => prev + "\n\nError occurred while generating email."
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      streamRef.current = null;
    }
  }

  return (
    <div>
      <Button onClick={() => setToggle(true)}>
        <AtSign /> Generate Email
      </Button>
      <Dialog
        open={toggle}
        onOpenChange={(open) => {
          if (!open && abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setToggle(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Generate an automated email for your completed tasks.
            </DialogTitle>
            {!emailContent && !loading && (
              <DialogDescription>
                This will generate an email with a summary of your completed
                tasks for the current week.
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Always show email content area when loading or when we have content */}
          {(loading || emailContent) && (
            <div className="mt-2">
              {loading && (
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating email...</span>
                </div>
              )}

              <div className="text-sm font-semibold">Email Content:</div>
              <div className="relative mt-2 rounded-md border border-input bg-background p-4">
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {emailContent || (loading ? "|" : "")}
                </pre>
                {loading && !emailContent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={funnyImage}
                      width={120}
                      height={120}
                      alt="Ghostwriter generating content"
                      className="animate-pulse opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button onClick={generateEmail} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                "Generate Email"
              )}
            </Button>
            <Button
              type="button"
              disabled={loading}
              variant="secondary"
              onClick={() => setToggle(false)}
              className="ml-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerateEmailDialog;
