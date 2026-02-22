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
import { log } from "console";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  selected?: string;
};

type Course = {
  id: string;
  name: string;
};

export default function QuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // fetch courses
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  async function generateQuiz() {
    if (!courseId) return toast.error("Select a course first");

    setLoading(true);
    setScore(null);
    console.log("Generating quiz for course:", courseId);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    });

    const data = await res.json();

    try {
      const parsedQuiz =
        typeof data.quiz === "string" ? JSON.parse(data.quiz) : data.quiz;

      if (!Array.isArray(parsedQuiz)) {
        toast.error("Quiz format invalid");
        return;
      }

      setQuiz(parsedQuiz);
    } catch (err) {
      console.error("Parse error:", err);
      toast.error("Failed to parse quiz data");
    }

    if (!Array.isArray(data.quiz)) {
      toast.error("Invalid quiz format");
      setLoading(false);
      return;
    }
    setLoading(false);
  }
  console.log(quiz);

  function selectAnswer(qIndex: number, option: string) {
    const updated = [...quiz];
    updated[qIndex].selected = option;
    setQuiz(updated);
  }

  function checkAnswers() {
    let s = 0;
    quiz.forEach((q) => {
      if (q.selected === q.answer) s++;
    });
    setScore(s);
  }

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white px-16 py-12">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">
        📘 Quiz Generator
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
          onClick={generateQuiz}
          className="bg-purple-500 hover:bg-purple-600"
        >
          Generate Quiz
        </Button>
      </div>

      {loading && <p className="text-zinc-400">Generating quiz...</p>}

      {/* Quiz */}
      <div className="grid gap-6 max-w-3xl">
        {quiz.map((q, i) => (
          <Card key={i} className="bg-zinc-950 text-white border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">
                {i + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.isArray(q.options) &&
                q.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`block p-2 rounded cursor-pointer border border-zinc-800 hover:bg-zinc-800 ${
                      q.selected === opt ? "bg-purple-600/30" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      className="mr-2"
                      onChange={() => selectAnswer(i, opt)}
                    />
                    {opt}
                  </label>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      {quiz.length > 0 && (
        <Button
          onClick={checkAnswers}
          className="mt-6 bg-green-500 hover:bg-green-600"
        >
          Submit Quiz
        </Button>
      )}

      {/* Score */}
      {score !== null && (
        <div className="mt-6 text-xl font-bold text-green-400">
          Score: {score} / {quiz.length}
        </div>
      )}
    </div>
  );
}
