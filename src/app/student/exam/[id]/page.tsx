import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AnswerSheet from "./AnswerSheet"

export default async function ExamViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  const student_id = session?.user?.id

  if (!student_id) return redirect("/login")

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      submissions: {
        where: { student_id }
      }
    }
  })

  if (!exam) return <div className="p-8">Exam not found</div>

  const now = new Date()
  if (now < new Date(exam.exam_release_time)) {
    return <div className="p-8">Exam has not started yet.</div>
  }

  const submission = exam.submissions.length > 0 ? exam.submissions[0] : null
  
  // Generating a unique key helps force the iframe to reload if solutions are released
  // Note: because the solutions release based on time, if a student is on the page right at the time, 
  // they would have to refresh. Appending timestamp works but would rerender every mount.
  // Instead, passing exam.id is fine.

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="bg-white border-b h-14 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
         <h1 className="font-semibold text-lg">{exam.title}</h1>
         <Link href="/student">
           <Button variant="outline" size="sm">Exit Exam</Button>
         </Link>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer - Left Side */}
        <div className="flex-1 border-r bg-gray-200 flex flex-col pb-safe">
           <iframe 
             src={`/api/exams/${exam.id}/pdf`}
             className="flex-1 w-full h-full border-0"
             title="Exam PDF"
           />
        </div>

        {/* Answer Sheet - Right Side */}
        <div className="w-80 lg:w-[400px] bg-white flex flex-col overflow-hidden">
          <AnswerSheet 
            exam={exam} 
            existingSubmission={submission} 
            studentId={student_id} 
          />
        </div>
      </div>
    </div>
  )
}
