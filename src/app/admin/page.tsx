import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import CreateExamForm from "./CreateExamForm"
import prisma from "@/lib/prisma"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  const exams = await prisma.exam.findMany({
    orderBy: { exam_release_time: "desc" }
  })
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-600">Logged in as {session?.user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <CreateExamForm />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xl font-bold">Recent Exams</h2>
            {exams.length === 0 ? (
              <p className="text-gray-500 text-sm">No exams created yet.</p>
            ) : (
              <div className="space-y-3">
                {exams.map(exam => (
                  <div key={exam.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-xs text-gray-500">
                      Release: {new Date(exam.exam_release_time).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Questions: {exam.total_questions}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
