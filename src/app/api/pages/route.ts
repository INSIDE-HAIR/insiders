import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  Template,
  PageStatus,
  OgType,
  TwitterCard,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

import * as z from "zod";

const prisma = new PrismaClient();

// Constantes de validación SEO
const SEO_LIMITS = {
  META_TITLE_MAX: 60,
  META_DESCRIPTION_MAX: 160,
  OG_TITLE_MAX: 95,
  OG_DESCRIPTION_MAX: 200,
  TWITTER_TITLE_MAX: 70,
  TWITTER_DESCRIPTION_MAX: 200,
} as const;

// Validador de URLs
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validador de formato de locale
const isValidLocale = (locale: string) => {
  const localeRegex = /^[a-z]{2}_[A-Z]{2}$/;
  return localeRegex.test(locale);
};

// Esquema base para URLs de imágenes
const imageUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      const extension = url.split(".").pop()?.toLowerCase();
      return extension
        ? ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
        : false;
    },
    {
      message:
        "URL must point to a valid image file (jpg, jpeg, png, gif, webp)",
    }
  );

const PageSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  slug: z.string().min(1, { message: "Slug is required" }),
  lang: z.string(),
  parentId: z.string().nullable(),
  level: z.number().min(1),
  status: z.nativeEnum(PageStatus).default("draft"),
  indexable: z.boolean().default(true),
  showInMenu: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  author: z.string(),
  template: z.nativeEnum(Template),
  order: z.number().optional(),

  // Meta tags básicos
  metaTitle: z
    .string()
    .max(SEO_LIMITS.META_TITLE_MAX, {
      message: `Meta title must not exceed ${SEO_LIMITS.META_TITLE_MAX} characters`,
    })
    .nullable()
    .optional(),
  metaDescription: z
    .string()
    .max(SEO_LIMITS.META_DESCRIPTION_MAX, {
      message: `Meta description must not exceed ${SEO_LIMITS.META_DESCRIPTION_MAX} characters`,
    })
    .nullable()
    .optional(),
  metaImage: imageUrlSchema.nullable().optional(),

  // Open Graph
  ogType: z.nativeEnum(OgType).default("website"),
  ogTitle: z
    .string()
    .max(SEO_LIMITS.OG_TITLE_MAX, {
      message: `Open Graph title must not exceed ${SEO_LIMITS.OG_TITLE_MAX} characters`,
    })
    .nullable()
    .optional(),
  ogDescription: z
    .string()
    .max(SEO_LIMITS.OG_DESCRIPTION_MAX, {
      message: `Open Graph description must not exceed ${SEO_LIMITS.OG_DESCRIPTION_MAX} characters`,
    })
    .nullable()
    .optional(),
  ogImage: imageUrlSchema.nullable().optional(),
  ogImageSecureUrl: imageUrlSchema.nullable().optional(),
  ogSiteName: z.string().nullable().optional(),
  ogLocale: z
    .string()
    .refine((locale) => isValidLocale(locale), {
      message: "Locale must be in format: xx_XX (e.g., es_ES, en_US)",
    })
    .default("es_ES"),

  // Campos específicos para artículos
  articleSection: z.string().nullable().optional(),

  // Twitter Cards
  twitterCard: z.nativeEnum(TwitterCard).default("summary_large_image"),
  twitterSite: z
    .string()
    .regex(/^@[A-Za-z0-9_]{1,15}$/, {
      message: "Twitter site must be a valid Twitter handle",
    })
    .nullable()
    .optional(),
  twitterCreator: z
    .string()
    .regex(/^@[A-Za-z0-9_]{1,15}$/, {
      message: "Twitter creator must be a valid Twitter handle",
    })
    .nullable()
    .optional(),
  twitterTitle: z
    .string()
    .max(SEO_LIMITS.TWITTER_TITLE_MAX, {
      message: `Twitter title must not exceed ${SEO_LIMITS.TWITTER_TITLE_MAX} characters`,
    })
    .nullable()
    .optional(),
  twitterDescription: z
    .string()
    .max(SEO_LIMITS.TWITTER_DESCRIPTION_MAX, {
      message: `Twitter description must not exceed ${SEO_LIMITS.TWITTER_DESCRIPTION_MAX} characters`,
    })
    .nullable()
    .optional(),
  twitterImage: imageUrlSchema.nullable().optional(),
  twitterImageAlt: z
    .string()
    .max(420, {
      message: "Twitter image alt text must not exceed 420 characters",
    })
    .nullable()
    .optional(),
});

const PageUpdateSchema = PageSchema.extend({ id: z.string() });

// Helper function to generate fullPath
async function generateFullPath(
  slug: string,
  parentId: string | null | undefined
): Promise<string> {
  if (!parentId || parentId === "root") return slug;
  const parent = await prisma.dynamicPage.findUnique({
    where: { id: parentId },
    select: { fullPath: true },
  });
  if (!parent) throw new Error("Parent page not found");
  return `${parent.fullPath}/${slug}`;
}

// GET method to fetch pages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") || "published") as PageStatus;
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

    const pages = await prisma.dynamicPage.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { fullPath: { contains: search, mode: "insensitive" } },
            ],
          },
          { status },
          ...(tags.length > 0
            ? [
                {
                  tags: {
                    hasSome: tags,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: [{ level: "asc" }, { parentId: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Error fetching pages" },
      { status: 500 }
    );
  }
}

// Helper function to check if slug is unique in the same level
async function isSlugUniqueInLevel(
  slug: string,
  parentId: string | null,
  currentId?: string
): Promise<boolean> {
  const existingPage = await prisma.dynamicPage.findFirst({
    where: {
      slug,
      parentId: parentId === "root" ? null : parentId,
      id: { not: currentId }, // Exclude the current page in case of update
    },
  });
  return !existingPage;
}

// POST method to create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PageSchema.parse(body);

    // Solo validar slug y fullPath si la página será publicada
    if (data.status === "published") {
      // Check if a page with this slug already exists at the same level
      const existingPage = await prisma.dynamicPage.findFirst({
        where: {
          slug: data.slug,
          parentId: data.parentId === "root" ? null : data.parentId,
          status: "published",
        },
      });

      if (existingPage) {
        return NextResponse.json(
          { error: "A page with this slug already exists at the same level" },
          { status: 400 }
        );
      }

      // Get parent page if parentId is provided
      let parentPage = null;
      if (data.parentId && data.parentId !== "root") {
        parentPage = await prisma.dynamicPage.findUnique({
          where: { id: data.parentId },
        });

        if (!parentPage) {
          return NextResponse.json(
            { error: "Parent page not found" },
            { status: 404 }
          );
        }
      }

      // Generate full path
      const fullPath = parentPage
        ? `${parentPage.fullPath}/${data.slug}`
        : data.slug;

      // Check if a page with this full path already exists
      const existingPageWithPath = await prisma.dynamicPage.findFirst({
        where: {
          fullPath,
          status: "published",
        },
      });

      if (existingPageWithPath) {
        return NextResponse.json(
          { error: "A page with this full path already exists" },
          { status: 400 }
        );
      }
    }

    // Create the page with all fields
    const page = await prisma.dynamicPage.create({
      data: {
        title: data.title,
        content: data.content ? JSON.stringify({ body: data.content }) : null,
        slug: `temp-${Date.now()}`, // Slug temporal
        fullPath:
          data.status === "published"
            ? data.parentId && data.parentId !== "root"
              ? `${
                  (
                    await prisma.dynamicPage.findUnique({
                      where: { id: data.parentId },
                    })
                  )?.fullPath || ""
                }/${data.slug}`
              : data.slug
            : `temp-${Date.now()}`,
        lang: data.lang,
        parentId: data.parentId === "root" ? null : data.parentId,
        level: data.level,
        status: data.status,
        indexable: data.indexable,
        showInMenu: data.showInMenu,
        tags: data.tags,
        author: data.author,
        template: data.template,
        order: data.order ?? 0,
        isEditable: true,
        // Meta tags básicos
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        metaImage: data.metaImage ?? null,
        // Open Graph
        ogType: data.ogType,
        ogTitle: data.ogTitle ?? null,
        ogDescription: data.ogDescription ?? null,
        ogImage: data.ogImage ?? null,
        ogImageSecureUrl: data.ogImageSecureUrl ?? null,
        ogSiteName: data.ogSiteName ?? null,
        ogLocale: data.ogLocale ?? "es_ES",
        // Campos específicos para artículos
        articleSection: data.articleSection ?? null,
        // Twitter Cards
        twitterCard: data.twitterCard,
        twitterSite: data.twitterSite ?? null,
        twitterCreator: data.twitterCreator ?? null,
        twitterTitle: data.twitterTitle ?? null,
        twitterDescription: data.twitterDescription ?? null,
        twitterImage: data.twitterImage ?? null,
        twitterImageAlt: data.twitterImageAlt ?? null,
      },
    });

    // Actualizar con el slug final basado en el estado
    const finalSlug =
      data.status === "published" ? data.slug : `${page.id}-${data.status}`;
    const finalFullPath =
      data.status === "published"
        ? data.parentId && data.parentId !== "root"
          ? `${
              (
                await prisma.dynamicPage.findUnique({
                  where: { id: data.parentId },
                })
              )?.fullPath
            }/${data.slug}`
          : data.slug
        : `${page.id}-${data.status}`;

    const updatedPage = await prisma.dynamicPage.update({
      where: { id: page.id },
      data: {
        slug: finalSlug,
        fullPath: finalFullPath,
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

// PUT method to update an existing page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PageUpdateSchema.parse(body);

    // Si no se proporciona slug, generarlo del título
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .trim();

    // Check if the page is editable
    const existingPage = await prisma.dynamicPage.findUnique({
      where: { id: data.id },
    });

    if (!existingPage) {
      throw new Error("Page not found");
    }

    if (!existingPage.isEditable) {
      return NextResponse.json(
        {
          error:
            "Esta página no se puede editar. Por favor, contacta al Desarrollador de la web.",
        },
        { status: 403 }
      );
    }

    // Check if the slug is unique in the same level
    const isUnique = await isSlugUniqueInLevel(slug, data.parentId, data.id);
    if (!isUnique) {
      return NextResponse.json(
        { error: "A page with this slug already exists at the same level" },
        { status: 400 }
      );
    }

    const updatedPageData: Prisma.DynamicPageUpdateInput = {
      title: data.title,
      content: data.content ? JSON.stringify({ body: data.content }) : null,
      slug: slug,
      lang: data.lang,
      status: data.status,
      indexable: data.indexable,
      showInMenu: data.showInMenu,
      tags: data.tags,
      author: data.author,
      template: data.template,
      order: data.order ?? 0,
      // Meta tags básicos
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      metaImage: data.metaImage ?? null,
      // Open Graph
      ogType: data.ogType,
      ogTitle: data.ogTitle ?? null,
      ogDescription: data.ogDescription ?? null,
      ogImage: data.ogImage ?? null,
      ogImageSecureUrl: data.ogImageSecureUrl ?? null,
      ogSiteName: data.ogSiteName ?? null,
      ogLocale: data.ogLocale ?? "es_ES",
      // Campos específicos para artículos
      articleSection: data.articleSection ?? null,
      // Twitter Cards
      twitterCard: data.twitterCard,
      twitterSite: data.twitterSite ?? null,
      twitterCreator: data.twitterCreator ?? null,
      twitterTitle: data.twitterTitle ?? null,
      twitterDescription: data.twitterDescription ?? null,
      twitterImage: data.twitterImage ?? null,
      twitterImageAlt: data.twitterImageAlt ?? null,
    };

    if (data.parentId === null || data.parentId === "root") {
      updatedPageData.parent = { disconnect: true };
      updatedPageData.level = 1;
      updatedPageData.fullPath = slug;
    } else {
      const parentPage = await prisma.dynamicPage.findUnique({
        where: { id: data.parentId },
      });
      if (!parentPage) throw new Error("Parent page not found");

      updatedPageData.parent = { connect: { id: data.parentId } };
      updatedPageData.level = parentPage.level + 1;
      updatedPageData.fullPath = `${parentPage.fullPath}/${slug}`;
    }

    // Check if the new fullPath already exists
    const existingPageWithFullPath = await prisma.dynamicPage.findFirst({
      where: {
        fullPath: updatedPageData.fullPath as string,
        id: { not: data.id },
      },
    });
    if (existingPageWithFullPath) {
      return NextResponse.json(
        { error: "A page with this full path already exists" },
        { status: 400 }
      );
    }

    const updatedPage = await prisma.dynamicPage.update({
      where: { id: data.id },
      data: updatedPageData,
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating page:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data format", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE method to delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteOption = searchParams.get("deleteOption");
    const pageId = params.id;

    // Check if the page exists and is editable
    const page = await prisma.dynamicPage.findUnique({
      where: { id: pageId },
      include: { children: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!page.isEditable) {
      return NextResponse.json(
        { error: "Page is not editable" },
        { status: 403 }
      );
    }

    if (page.children && page.children.length > 0) {
      if (deleteOption === "cascade") {
        // Delete all children recursively
        await prisma.dynamicPage.updateMany({
          where: {
            OR: [
              { id: pageId },
              { fullPath: { startsWith: `${page.fullPath}/` } },
            ],
          },
          data: { status: "deleted" as PageStatus },
        });
      } else if (deleteOption === "moveUp") {
        // Move children up one level
        for (const child of page.children) {
          await prisma.dynamicPage.update({
            where: { id: child.id },
            data: {
              parentId: page.parentId,
              level: page.level,
              fullPath: child.fullPath.replace(
                `${page.fullPath}/`,
                page.parentId
                  ? `${page.fullPath.split("/").slice(0, -1).join("/")}/`
                  : ""
              ),
            },
          });
        }
        // Delete the page
        await prisma.dynamicPage.update({
          where: { id: pageId },
          data: { status: "deleted" as PageStatus },
        });
      }
    } else {
      // Delete the page if it has no children
      await prisma.dynamicPage.update({
        where: { id: pageId },
        data: { status: "deleted" as PageStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
