"use client";
import React, { useState } from "react";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { Package2Icon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { userSchema } from "@/src/lib/types/inside-schemas";

export default function UserForm({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const form = useForm({
    defaultValues: formData,
    resolver: async (values) => {
      const result = userSchema.safeParse(values);
      return {
        values: result.success ? result.data : {},
        errors: result.success ? {} : result.error.flatten(),
      };
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!isValid) return;

    const response = await fetch("/api/updateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.getValues()),
    });

    if (response.ok) {
      setIsEditing(false);
    } else {
      console.error("Error al actualizar el usuario");
    }
  };

  return (
    <>
      <header className="max-w-full col-start-1 col-end-full md:col-end-6 lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
        <Link className="lg:hidden" href="#">
          <Package2Icon className="h-6 w-6" />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Usuario: {user.email}</h1>
        </div>
        <div className=" flex gap-2 items-center">
          <Button className="ml-auto h-8 w-8 lg:hidden" size="icon">
            <SearchIcon className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          {isEditing ? (
            <Button size="sm" onClick={handleSaveClick}>
              Guardar
            </Button>
          ) : (
            <Button size="sm" onClick={handleEditClick}>
              Editar
            </Button>
          )}
        </div>
      </header>
      <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 md:col-end-6 lg:col-start-3 lg:col-end-13 order-2 md:order-1 z-30 col-span-full">
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4">
            Información del Usuario
          </h2>
          <Form {...form}>
            <form onSubmit={handleSaveClick} className="space-y-8">
              {Object.keys(formData).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as keyof typeof formData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            form.setValue(
                              key as keyof typeof formData,
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        {key === "email"
                          ? "This is your public display email."
                          : null}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
}
