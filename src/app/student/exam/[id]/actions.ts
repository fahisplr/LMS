"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitExam(examId: string, studentId: string, submittedAnswers: Record<string, string>) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  })

  if (!exam) throw new Error("Exam not found")

  // Check if they already submitted
  const existing = await prisma.submission.findFirst({
    where: { exam_id: examId, student_id: studentId }
  })
  if (existing) throw new Error("Already submitted")

  // Calculate score
  let score = 0
  const answerKey = exam.answer_key as Record<string, string>

  for (let i = 1; i <= exam.total_questions; i++) {
    const q = String(i)
    const studentAns = submittedAnswers[q]
    const correctAns = answerKey[q]

    if (!studentAns) {
      continue // Unanswered: 0 marks
    }

    if (studentAns === correctAns) {
      score += exam.marks_correct
    } else {
      score += exam.marks_negative 
    }
  }

  await prisma.submission.create({
    data: {
      exam_id: examId,
      student_id: studentId,
      submitted_answers: submittedAnswers,
      score
    }
  })

  revalidatePath(`/student/exam/${examId}`)
  return { success: true, score }
}
