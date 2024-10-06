import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const totalStudents = await prisma.student.count()
  const totalPayments = await prisma.payment.count()
  const outstandingPayments = await prisma.payment.count({
    where: { status: "PENDING" }
  })

  const recentTransactions = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { student: { include: { user: true } } }
  })

  const paymentData = await prisma.payment.groupBy({
    by: ['status'],
    _count: true,
    _sum: {
      amount: true
    }
  })

  const chartData = paymentData.map(item => ({
    status: item.status,
    count: item._count,
    amount: item._sum.amount || 0
  }))

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{outstandingPayments}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
              <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {recentTransactions.map((transaction) => (
              <li key={transaction.id} className="mb-2">
                {transaction.student.user.name} - ${transaction.amount} ({transaction.status})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}