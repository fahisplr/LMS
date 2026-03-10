"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { submitExam } from "./actions"

export default function AnswerSheet({ exam, existingSubmission, studentId }: any) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    existingSubmission ? (existingSubmission.submitted_answers || {}) : {}
  )
  const [loading, setLoading] = useState(false)

  const isSubmitted = !!existingSubmission
  const totalQuestions = exam.total_questions
  const isSolutionsReleased = new Date() >= new Date(exam.answer_key_release_time)

  const handleSelect = (q: string, option: string) => {
    if (isSubmitted) return
    setAnswers(prev => ({ ...prev, [q]: option }))
  }

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? You cannot change your answers later.")) return
    
    setLoading(true)
    try {
      await submitExam(exam.id, studentId, answers)
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const options = ["A", "B", "C", "D"]
  
  const getOptionClass = (q: string, option: string) => {
    const isSelected = answers[q] === option
    if (!isSubmitted) {
      return isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 hover:bg-gray-100"
    }

    // Submitted state coloring logic
    const correctAns = exam.answer_key[q]
    const isCorrect = answers[q] === correctAns

    if (isSelected) {
      if (isCorrect) return "bg-green-500 border-green-500 text-white"
      return "bg-red-500 border-red-500 text-white"
    }
    return "border-gray-300 bg-gray-50 opacity-50"
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold">Answer Sheet</h2>
        {isSubmitted && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center justify-between">
              Your Score:
              <span className="text-2xl font-bold">{existingSubmission.score}</span>
            </h3>
            {isSolutionsReleased ? (
              <p className="text-sm mt-3 text-green-700 bg-green-50 p-2 rounded border border-green-200">
                Detailed solutions are now available in the PDF viewer! Refresh if you don't see them.
              </p>
            ) : (
              <p className="text-sm mt-3 text-gray-600 border-t border-blue-200 pt-2">
                Solutions will be visible here at <br/><span className="font-semibold">{new Date(exam.answer_key_release_time).toLocaleString()}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const q = String(i + 1)
          return (
            <div key={q} className="flex items-center space-x-4 p-2 rounded hover:bg-gray-100 transition-colors">
              <div className="w-8 font-semibold text-gray-500 text-right">{q}.</div>
              <div className="flex space-x-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    disabled={isSubmitted}
                    onClick={() => handleSelect(q, opt)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-medium transition-colors ${getOptionClass(q, opt)}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {!isSubmitted && (
        <div className="pt-6 mt-auto border-t">
          <Button 
            className="w-full h-12 text-lg font-semibold" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      )}
    </div>
  )
}
