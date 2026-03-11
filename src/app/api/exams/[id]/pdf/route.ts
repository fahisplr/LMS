import { NextResponse, NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { PDFDocument } from "pdf-lib"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const exam = await prisma.exam.findUnique({
    where: { id }
  })

  if (!exam) return new NextResponse("Not Found", { status: 404 })

  // Fetch the PDF from Blob
  let arrayBuffer: ArrayBuffer
  try {
    const response = await fetch(exam.pdf_file_url)
    if (!response.ok) throw new Error("Failed to fetch PDF")
    arrayBuffer = await response.arrayBuffer()
  } catch (error) {
    return new NextResponse("Failed to download PDF", { status: 500 })
  }

  const now = new Date()
  const releaseTime = new Date(exam.answer_key_release_time)

  if (now < releaseTime) {
    // Slice PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const newPdf = await PDFDocument.create()

    // e.g., if question_page_end = 5, we copy pages 0, 1, 2, 3, 4
    const pageIndices = Array.from(
      { length: Math.min(exam.question_page_end, pdfDoc.getPageCount()) }, 
      (_, i) => i
    )
    
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
    copiedPages.forEach((page) => newPdf.addPage(page))

    const pdfBytes = await newPdf.save()
    return new NextResponse(pdfBytes as any, {
      headers: { 
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store, max-age=0"
      }
    })
  }

  // Return full PDF
  return new NextResponse(arrayBuffer, {
    headers: { 
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store, max-age=0" 
    }
  })
}
