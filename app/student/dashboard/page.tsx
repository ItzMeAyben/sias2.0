import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      payments: {
        orderBy: { dueDate: "asc" },
        take: 5
      }
    }
  })

  if (!student) {
    return <div>Student profile not found</div>
  }

  const totalPaid = student.payments
    .filter(payment => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const totalPending = student.payments
    .filter(payment => payment.status === "PENDING")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {student.user.name}</p>
            <p><strong>Email:</strong> {student.user.email}</p>
            <p><strong>Course:</strong> {student.course}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
            <p><strong>Pending Payments:</strong> ${totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {student.payments.map((payment) => (
              <li key={payment.id} className="mb-2">
                ${payment.amount} - Due: {payment.dueDate.toLocaleDateString()} ({payment.status})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}