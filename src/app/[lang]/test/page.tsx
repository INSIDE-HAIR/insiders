"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea"; // Asume que tienes un componente de Textarea
import { toast, Toaster } from "sonner";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

const FormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().min(1, { message: "Content is required." }),
  slug: z.string().min(1, { message: "Slug is required." }),
  parentId: z.string().optional(),
  level: z.number().min(1, { message: "Level must be at least 1." }).optional(),
  isPublished: z.boolean().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function CreatePage() {
  const t = useTranslations("PageCreator");
  const f = useTranslations("PageCreator.form");
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      level: 1,
      isPublished: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create page.");
      toast.success(f("createSuccessDescription", { title: data.title }));
      form.reset();
    } catch (error) {
      toast.error(f("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <h1>{t("title")}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("titleLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={f("titlePlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{f("titleDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("contentLabel")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={f("contentPlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{f("contentDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("slugLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={f("slugPlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{f("slugDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("parentPageLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={f("selectParentPage")} {...field} />
                </FormControl>
                <FormDescription>{f("parentPageDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("levelLabel")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>{f("levelDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f("publishLabel")}</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>{f("publishDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? f("creatingButton") : f("createButton")}
          </Button>
        </form>
      </Form>
    </>
  );
}
