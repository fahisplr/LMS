"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createExam } from "./actions"

export default function CreateExamForm() {
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [answerKey, setAnswerKey] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAnswerChange = (questionNum: string, answer: string) => {
    setAnswerKey(prev => ({
      ...prev,
      [questionNum]: answer
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData(e.currentTarget)
    formData.append("answer_key", JSON.stringify(answerKey))

    try {
      const res = await createExam(formData)
      if (res.success) {
        setMessage("Exam created successfully!")
        e.currentTarget.reset()
        setAnswerKey({})
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Exam</CardTitle>
        <CardDescription>Upload a PDF and configure grading / answer key.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">General Details</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Midterm Physics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_file">PDF File Upload</Label>
              <Input id="pdf_file" name="pdf_file" type="file" accept="application/pdf" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam_release_time">Exam Release Time</Label>
                <Input id="exam_release_time" name="exam_release_time" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer_key_release_time">Answer Key Release Time</Label>
                <Input id="answer_key_release_time" name="answer_key_release_time" type="datetime-local" required />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">PDF & Grading Config</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question_page_end">Last Page of Questions</Label>
                <Input id="question_page_end" name="question_page_end" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks_correct">Marks (Correct)</Label>
                <Input id="marks_correct" name="marks_correct" type="number" step="0.5" defaultValue="4" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks_negative">Marks (Negative)</Label>
                <Input id="marks_negative" name="marks_negative" type="number" step="0.5" defaultValue="-1" required />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Answer Key Builder</h3>
            <div className="space-y-2">
              <Label htmlFor="total_questions">Total Questions</Label>
              <Input 
                id="total_questions" 
                name="total_questions" 
                type="number" 
                min="1" 
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto p-2 border rounded">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const qNum = String(i + 1)
                return (
                  <div key={qNum} className="flex flex-col space-y-1">
                    <Label className="text-xs text-center">Q{qNum}</Label>
                    <select 
                      className="border rounded p-1 text-sm bg-background"
                      value={answerKey[qNum] || ""}
                      onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                      required
                    >
                      <option value="" disabled>Select</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded text-sm ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Uploading & Saving..." : "Create Exam"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
