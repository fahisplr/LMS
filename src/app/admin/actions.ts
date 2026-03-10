"use server"

import { put } from "@vercel/blob"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createExam(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const file = formData.get("pdf_file") as File
  const exam_release_time = new Date(formData.get("exam_release_time") as string)
  const answer_key_release_time = new Date(formData.get("answer_key_release_time") as string)
  const question_page_end = parseInt(formData.get("question_page_end") as string)
  const marks_correct = parseFloat(formData.get("marks_correct") as string)
  const marks_negative = parseFloat(formData.get("marks_negative") as string)
  const total_questions = parseInt(formData.get("total_questions") as string)
  const answer_key = JSON.parse(formData.get("answer_key") as string)

  if (!file) {
    throw new Error("No file uploaded")
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, { access: "public" })

  // Save to DB
  const exam = await prisma.exam.create({
    data: {
      title,
      pdf_file_url: blob.url,
      question_page_end,
      total_questions,
      marks_correct,
      marks_negative,
      exam_release_time,
      answer_key_release_time,
      answer_key
    }
  })

  revalidatePath("/admin")
  revalidatePath("/student")
  
  return { success: true, examId: exam.id }
}
