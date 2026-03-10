import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  
  const exams = await prisma.exam.findMany({
    orderBy: { exam_release_time: "asc" }
  })
  
  // Calculate this on server so it's a fixed snapshot, but we could also calculate purely on client for realtime
  const now = new Date()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-gray-600">Logged in as {session?.user?.email}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length === 0 ? (
            <p className="text-gray-500">No exams available yet.</p>
          ) : (
            exams.map(exam => {
              const releaseTime = new Date(exam.exam_release_time)
              const answKeyTime = new Date(exam.answer_key_release_time)
              const isLocked = now < releaseTime
              
              return (
                <Card key={exam.id} className={`${isLocked ? "opacity-75 bg-gray-50 flex flex-col justify-between" : "flex flex-col justify-between"}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    <CardDescription>
                      <div>Release: {releaseTime.toLocaleString()}</div>
                      <div>Solutions: {answKeyTime.toLocaleString()}</div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        Total Questions: <span className="font-semibold">{exam.total_questions}</span>
                        <br/>
                        Marking: <span className="text-green-600">+{exam.marks_correct}</span> / <span className="text-red-500">{exam.marks_negative}</span>
                      </div>
                      
                      {isLocked ? (
                        <Button disabled className="w-full">
                          Starts in {Math.max(0, Math.floor((releaseTime.getTime() - now.getTime()) / 60000))} mins
                        </Button>
                      ) : (
                        <Link href={`/student/exam/${exam.id}`}>
                          <Button className="w-full">
                            Start Exam / View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
