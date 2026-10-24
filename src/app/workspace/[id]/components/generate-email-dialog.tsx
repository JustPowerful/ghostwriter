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
import { AtSign, Copy, Loader2, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const GenerateEmailDialog = ({ workspaceId }: { workspaceId: string }) => {
  const [toggle, setToggle] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamRef = useRef<ReadableStream | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  async function generateEmail() {
    try {
      setLoading(true);
      setEmailContent("");

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      console.log("Starting email generation...");
      const response = await fetch(`/api/generateemail`, {
        method: "POST",
        body: JSON.stringify({ workspaceId }),
        signal: abortControllerRef.current.signal,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response doesn't have a body");
      }

      streamRef.current = response.body;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const text = decoder.decode(result.value, { stream: !done });
          setEmailContent((currentContent) => currentContent + text);
        }
      }
    } catch (error) {
      console.error("Error generating email:", error);
      setEmailContent((prev) => prev + "\n\nError occurred while generating email.");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      streamRef.current = null;
    }
  }

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setToggle(true)}>
        <AtSign className="w-4 h-4 mr-1.5" /> Generate email
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
            <DialogTitle>Generate email summary</DialogTitle>
            {!emailContent && !loading && (
              <DialogDescription>
                Creates an email with a summary of completed tasks for this week.
              </DialogDescription>
            )}
          </DialogHeader>

          {(loading || emailContent) && (
            <div className="mt-4 space-y-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating email...</span>
                </div>
              )}

              {emailContent && (
                <Button
                  className={cn(
                    "w-full justify-start",
                    copied && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  )}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(emailContent);
                    setCopied(true);
                  }}
                  disabled={loading}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy email content"}
                </Button>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Content
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <pre className="text-sm whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto font-sans text-slate-900">
                    {emailContent || (loading ? "▋" : "")}
                  </pre>
                  {loading && !emailContent && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Image
                        src={funnyImage}
                        width={120}
                        height={120}
                        alt="Ghostwriter generating content"
                        className="animate-pulse opacity-30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setToggle(false)} disabled={loading}>
              <X className="w-4 h-4 mr-1.5" /> Close
            </Button>
            <Button onClick={generateEmail} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate email"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerateEmailDialog;