"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  course: z.string().min(2, {
    message: "Course must be at least 2 characters.",
  }),
})

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: "",
      course: "",
    },
  })

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setStudent(data)
          form.reset({
            name: data.user.name,
            email: data.user.email,
            dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
            course: data.course,
          })
        } else {
          throw new Error("Failed to fetch student data")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch student data",
          variant: "destructive",
        })
      }
    }
    fetchStudent()
  }, [params.id, form, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student information updated successfully",
        })
        router.push('/admin/students')
      } else {
        throw new Error("Failed to update student information")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
      })
    }
  }

  if (!student) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Student</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update Student</Button>
        </form>
      </Form>
    </div>
  )
}