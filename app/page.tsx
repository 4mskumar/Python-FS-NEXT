"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileDiff, Youtube, MessageCircle, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FloatingChatBot from "./chat/page";

export default function Home() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing your content...");
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    if (!loading) return;

    const messages = [
      "Processing your content...",
      "This may take up to a minute...",
      "Server is busy, stay with us...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[i % messages.length]);
      i++;
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  async function uploadPDF() {
    if (!file) return toast.error("Select a PDF");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseName);
    

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process-pdf`, {
        method: "POST",
        body: formData,
      });

      const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: courseName }),
      });

      if (!res.ok || !res2.ok) throw new Error();
      toast.success("PDF processed successfully");
    } catch (err) {
      toast.error("PDF upload failed");
    } finally {
      setLoading(false);
      setCourseName('')
    }
  }

  async function processVideo() {
    if (!videoUrl) return toast.error("Enter YouTube URL");

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: videoUrl, course_id: courseName }),
      });

      if (!res.ok) throw new Error();
      toast.success("Video processed successfully");
    } catch {
      toast.error("Video processing failed");
    } finally {
      setLoading(false);
      setCourseName('')
    }
  }

  return (
    <div className="min-h-screen w-[200%] bg-zinc-900 text-white px-16 py-12">
      <nav>
        <h1 className="text-4xl font-semibold">
          Welcome back, <span className="text-blue-500">aspirant</span> 👋
        </h1>
        <p className="text-zinc-400 mt-2">Create AI-powered study notes</p>
      </nav>

      <section className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Upload Content</h3>

          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-600">
                  <Youtube className="mr-2" /> Convert Video
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white">
                <DialogHeader>
                  <DialogTitle>YouTube URL</DialogTitle>
                </DialogHeader>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube link..."
                  className="bg-zinc-800"
                />
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Course name"
                  className="bg-zinc-800"
                />
                
                <Button onClick={processVideo} className="mt-4 bg-red-500 w-full">
                  Process Video
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <FileDiff className="mr-2" /> Convert PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white">
                <DialogHeader>
                  <DialogTitle>Upload PDF</DialogTitle>
                </DialogHeader>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="bg-zinc-800"
                />
                 <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Course name"
                  className="bg-zinc-800"
                />
                <Button onClick={uploadPDF} className="mt-4 bg-blue-500 w-full">
                  Upload PDF
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            {loadingText}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

        <Card onClick={() => router.push("/quiz")} className="cursor-pointer bg-zinc-950 border-zinc-800 hover:scale-105 transition">
          <CardHeader>
            <CardTitle className="flex gap-2 text-purple-400">
              <BookOpen /> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">Generate quizzes</CardContent>
        </Card>

        <Card onClick={() => router.push("/flashcards")} className="cursor-pointer bg-zinc-950 border-zinc-800 hover:scale-105 transition">
          <CardHeader>
            <CardTitle className="flex gap-2 text-pink-400">
              🃏 Flashcards
            </CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">Revise faster</CardContent>
        </Card>
      </section>

      
    </div>
  );
}