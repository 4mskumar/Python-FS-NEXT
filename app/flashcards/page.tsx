"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Flashcard = {
  question: string;
  answer: string;
};

type Course = {
  id: string;
  name: string;
};

export default function FlashcardsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);

  // fetch courses (same as quiz)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  async function generateFlashcards() {
    if (!courseId) return toast.error("Select a course first");

    setLoading(true);
    setFlipped(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await res.json();
    console.log("Flashcards raw:", data);

    try {
      const parsed =
        typeof data.flashcards === "string"
          ? JSON.parse(data.flashcards)
          : data.flashcards;

      if (!Array.isArray(parsed)) {
        toast.error("Invalid flashcards format");
        setLoading(false);
        return;
      }

      setCards(parsed);
    } catch (err) {
      console.error("Parse error:", err);
      toast.error("Failed to parse flashcards");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white px-16 py-12">
      <h1 className="text-4xl font-bold mb-8 text-pink-400">
        📒 Flashcards Generator
      </h1>

      {/* Select Course */}
      <div className="flex gap-4 mb-8 w-full max-w-xl">
        <Select onValueChange={setCourseId}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={generateFlashcards}
          className="bg-pink-500 hover:bg-pink-600"
        >
          Generate Flashcards
        </Button>
      </div>

      {loading && <p className="text-zinc-400">Generating flashcards...</p>}

      {/* Flashcards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {cards.map((card, i) => (
          <Card
            key={i}
            onClick={() => setFlipped(flipped === i ? null : i)}
            className="cursor-pointer bg-zinc-950 text-white border-zinc-800 hover:bg-zinc-900"
          >
            <CardHeader>
              <CardTitle className="text-lg text-center">
                Flashcard {i + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-center">
              {flipped === i ? card.answer : card.question}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}