import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else {
    redirect("/student/dashboard")
  }

  return null
}