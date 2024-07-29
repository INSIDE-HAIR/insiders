// src/pages/api/pages.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

const PageSchema = z.object({
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  lang: z.string(),
  parentId: z.string().optional(),
  level: z.number().optional(),
  isPublished: z.boolean().optional(),
});

// Type guard to check if an error has a message property
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const data = PageSchema.parse(req.body);
      const newPage = await prisma.dynamicPage.create({
        data: {
          title: data.title,
          content: JSON.stringify({ body: data.content }),
          slug: data.slug,
          lang: data.lang,
          fullPath: data.parentId ? `${data.parentId}/${data.slug}` : data.slug,
          parentId: data.parentId,
          level: data.level || 1,
          isPublished: data.isPublished || false,
        },
      });
      res.status(201).json(newPage);
    } catch (error) {
      const errorMessage = isErrorWithMessage(error)
        ? error.message
        : "An unknown error occurred";
      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
