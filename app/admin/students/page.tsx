import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const students = await prisma.student.findMany({
    include: { user: true },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Student Management</h1>
      <div className="mb-4">
        <Link href="/admin/students/new">
          <Button>Add New Student</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={students} />
    </div>
  )
}