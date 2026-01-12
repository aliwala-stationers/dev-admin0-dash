"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCategory, useUpdateCategory } from "@/hooks/api/useCategories"; // <--- HOOKS

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  status: z.boolean(),
});
type CategoryFormValues = z.infer<typeof categorySchema>;

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const { data: category, isLoading } = useCategory(id);
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "", status: true },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description,
        status: category.status,
      });
    }
  }, [category, form]);

  async function onSubmit(values: CategoryFormValues) {
    try {
      await updateMutation.mutateAsync({ id, data: values });
      toast.success("Category updated");
      router.push("/admin/categories");
    } catch (error) {
      toast.error("Failed to update category");
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/categories"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-semibold">Edit Category</h1>
        </div>
        <Button 
            className="bg-accent-blue hover:bg-accent-blue-hover"
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Update Category
          </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Category Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
               {/* Same fields as Add Page */}
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <FormLabel>Active Status</FormLabel><Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormItem>
                )} />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}