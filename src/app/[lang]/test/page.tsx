"use client";
import { Fragment, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { toast, Toaster } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

import { DynamicPage, Template } from "@prisma/client";

type Page = DynamicPage & { children?: Page[] };

const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().min(1, { message: "Content is required." }),
  slug: z.string().min(1, { message: "Slug is required." }),
  lang: z.string().min(1, { message: "Language is required." }),
  parentId: z.string().nullable(),
  level: z.number().min(1, { message: "Level must be at least 1." }),
  isPublished: z.boolean(),
  author: z.string().min(1, { message: "Author is required." }),
  template: z.nativeEnum(Template).default(Template.sideMenuAndTabs),
});

type FormData = z.infer<typeof FormSchema>;

export default function PageCreator() {
  const t = useTranslations("PageCreator");
  const a = useTranslations("PageCreator.actions");
  const s = useTranslations("PageCreator.search");
  const ta = useTranslations("PageCreator.table");
  const m = useTranslations("PageCreator.messages");
  const d = useTranslations("PageCreator.deleteDialog");
  const f = useTranslations("PageCreator.form");

  const router = useRouter();

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreatingSubpage, setIsCreatingSubpage] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    hasChildren: false,
    childCount: 0,
    pageToDelete: null as Page | null,
  });
  const [search, setSearch] = useState("");
  const [isPublishedFilter, setIsPublishedFilter] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      lang: "en",
      parentId: null,
      level: 1,
      isPublished: false,
      author: "",
    },
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/pages?search=${search}&isPublished=${isPublishedFilter}`
      );
      if (!response.ok) throw new Error("Failed to fetch pages.");
      const data: Page[] = await response.json();
      setPages(data);
    } catch (error) {
      toast.error(m("errorLoadingPages"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isPublishedFilter]);

  const renderTemplateOptions = () => {
    return Object.values(Template)
      .filter((template) => template !== "custom")
      .map((template) => (
        <SelectItem key={template} value={template}>
          {template}
        </SelectItem>
      ));
  };

  const organizePages = (pages: Page[]): Page[] => {
    const pageMap = new Map<string, Page>();
    const rootPages: Page[] = [];

    pages.forEach((page) => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    pageMap.forEach((page) => {
      if (page.parentId) {
        const parent = pageMap.get(page.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(page);
        }
      } else {
        rootPages.push(page);
      }
    });

    return rootPages;
  };

  const handleViewPage = (page: Page) => {
    router.push(`/${page.fullPath}`);
  };

  const handleEditContent = (page: Page) => {
    router.push(`/${page.fullPath}/edit`);
  };

  const renderPageHierarchy = (
    pages: Page[],
    level: number = 0
  ): JSX.Element[] => {
    return pages.flatMap((page) => [
      <TableRow key={page.id}>
        <TableCell>
          <span style={{ marginLeft: `${level * 20}px` }}>{page.title}</span>
        </TableCell>
        <TableCell>{page.author}</TableCell>
        <TableCell>{page.isPublished ? t("published") : t("draft")}</TableCell>
        <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button onClick={() => handleViewPage(page)}>{a("view")}</Button>
            <Button onClick={() => handleEditContent(page)}>
              {a("editContent")}
            </Button>
            <Button
              onClick={() => handleEditPage(page)}
              disabled={!page.isEditable}
            >
              {a("edit")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeletePage(page)}
              disabled={!page.isEditable}
            >
              {a("delete")}
            </Button>
          </div>
        </TableCell>
      </TableRow>,
      ...(page.children ? renderPageHierarchy(page.children, level + 1) : []),
    ]);
  };

  const renderSelectOptions = (
    pages: Page[],
    level: number = 0
  ): JSX.Element[] => {
    const options = [
      level === 0 ? (
        <SelectItem key="root" value="root">
          {f("noParent")}
        </SelectItem>
      ) : null,
      ...pages.map((page) => (
        <Fragment key={page.id}>
          <SelectItem value={page.id}>
            {"\u00A0".repeat(level * 2)}
            {page.title}
          </SelectItem>
          {page.children && renderSelectOptions(page.children, level + 1)}
        </Fragment>
      )),
    ].flat();

    // Filter out null values
    return options.filter((option): option is JSX.Element => option !== null);
  };

  const handleParentChange = (parentId: string) => {
    const isRoot = parentId === "root";
    form.setValue("parentId", isRoot ? null : parentId);
    const parentPage = isRoot
      ? null
      : pages.find((page) => page.id === parentId);
    const newLevel = parentPage ? parentPage.level + 1 : 1;
    form.setValue("level", newLevel);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setIsUpdating(true);
    try {
      const method = data.id ? "PUT" : "POST";
      const submitData = {
        ...data,
        parentId: data.parentId === null ? "root" : data.parentId,
      };
      const response = await fetch("/api/pages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.status === 403) {
        const errorData = await response.json();
        toast.error(errorData.error);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${data.id ? "update" : "create"} page.`
        );
      }

      const updatedPage: Page = await response.json();

      if (data.id) {
        toast.success(f("updateSuccessDescription", { title: data.title }));
        setSelectedPage(updatedPage);
      } else {
        toast.success(f("createSuccessDescription", { title: data.title }));
        setSelectedPage(null);
      }

      await fetchPages();
      form.reset();
      setIsFormOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.error("Submit error:", error);
      } else {
        toast.error(f("errorMessage"));
        console.error("Submit error:", error);
      }
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleCreatePage = () => {
    setSelectedPage(null);
    form.reset();
    setIsFormOpen(true);
    setIsCreatingSubpage(false);
  };

  const handleCreateSubpage = () => {
    setSelectedPage(null);
    form.reset();
    setIsFormOpen(true);
    setIsCreatingSubpage(true);
  };

  const handleEditPage = (page: Page) => {
    if (!page.isEditable) {
      toast.error(t("pageNotEditableMessage"));
      return;
    }

    setSelectedPage(page);
    form.reset({
      id: page.id,
      title: page.title,
      content: JSON.parse(page.content as string).body,
      slug: page.slug,
      lang: page.lang,
      parentId: page.parentId || null,
      level: page.level,
      isPublished: page.isPublished,
      author: page.author,
    });
    setIsFormOpen(true);
    setIsCreatingSubpage(false);
  };

  const handleDeletePage = (page: Page) => {
    if (!page.isEditable) {
      toast.error(t("pageNotEditableMessage"));
      return;
    }

    setDeleteDialogState({
      isOpen: true,
      hasChildren: !!(page.children && page.children.length > 0),
      childCount: page.children ? page.children.length : 0,
      pageToDelete: page,
    });
  };

  const handleDeleteConfirm = async (option?: string) => {
    if (deleteDialogState.pageToDelete) {
      setIsLoading(true);
      try {
        const url = `/api/pages?id=${deleteDialogState.pageToDelete.id}${
          option ? `&deleteOption=${option}` : ""
        }`;
        const response = await fetch(url, { method: "DELETE" });

        if (response.status === 403) {
          const errorData = await response.json();
          toast.error(errorData.error);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete page.");
        }
        toast.success(
          m("deleteSuccess", { title: deleteDialogState.pageToDelete.title })
        );
        await fetchPages();
        setSelectedPage(null);
        form.reset();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Delete error:", error);
          toast.error(
            m("deleteError", {
              title: deleteDialogState.pageToDelete?.title,
              error: error.message,
            })
          );
        } else {
          console.error("Delete error:", error);
          toast.error(
            m("deleteError", {
              title: deleteDialogState.pageToDelete?.title,
              error: "An unknown error occurred.",
            })
          );
        }
      } finally {
        setIsLoading(false);
        setDeleteDialogState({
          isOpen: false,
          hasChildren: false,
          childCount: 0,
          pageToDelete: null,
        });
      }
    }
  };
  return (
    <>
      <Toaster position="top-right" />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <div className="mb-4 flex space-x-2">
          <Button onClick={handleCreatePage}>{a("createNewPage")}</Button>
          <Button onClick={handleCreateSubpage}>{a("createSubpage")}</Button>
        </div>

        <div className="mb-4 flex space-x-2">
          <Input
            placeholder={s("searchPages")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={isPublishedFilter ? "published" : "all"}
            onValueChange={(value) =>
              setIsPublishedFilter(value === "published")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={s("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{s("allPages")}</SelectItem>
              <SelectItem value="published">{s("publishedOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ta("title")}</TableHead>
              <TableHead>{ta("author")}</TableHead>
              <TableHead>{ta("status")}</TableHead>
              <TableHead>{ta("lastModified")}</TableHead>
              <TableHead>{ta("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {m("loading")}
                </TableCell>
              </TableRow>
            ) : (
              renderPageHierarchy(organizePages(pages))
            )}
          </TableBody>
        </Table>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPage ? a("editPage") : a("createPage")}
              </DialogTitle>
            </DialogHeader>
            <FormProvider {...form}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f("titleLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={f("titlePlaceholder")}
                            {...field}
                          />
                        </FormControl>
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
                          <Textarea
                            placeholder={f("contentPlaceholder")}
                            {...field}
                          />
                        </FormControl>
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
                          <Input
                            placeholder={f("slugPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f("langLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={f("langPlaceholder")}
                            {...field}
                          />
                        </FormControl>
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
                        <Select
                          onValueChange={handleParentChange}
                          value={field.value || "root"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={f("selectParentPage")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {renderSelectOptions(organizePages(pages))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{f("publishLabel")}</FormLabel>
                          <FormDescription>
                            {f("publishDescription")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f("templateLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={selectedPage !== null}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={f("selectTemplate")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {renderTemplateOptions()}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {f("templateDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f("authorLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={f("authorPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? m("saving")
                      : selectedPage
                      ? a("updatePage")
                      : a("createPage")}
                  </Button>
                </form>
              </Form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteDialogState.isOpen}
          onOpenChange={(isOpen) =>
            setDeleteDialogState((prev) => ({ ...prev, isOpen }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteDialogState.hasChildren
                  ? d("deletePageWithChildren")
                  : d("deletePageConfirmation")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialogState.hasChildren
                  ? d("deletePageWithChildrenDescription", {
                      count: deleteDialogState.childCount,
                    })
                  : d("deletePageConfirmation")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{a("cancel")}</AlertDialogCancel>
              {deleteDialogState.hasChildren ? (
                <>
                  <AlertDialogAction
                    onClick={() => handleDeleteConfirm("cascade")}
                  >
                    {d("deleteCascade")}
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => handleDeleteConfirm("moveUp")}
                  >
                    {d("deleteMoveUp")}
                  </AlertDialogAction>
                </>
              ) : (
                <AlertDialogAction onClick={() => handleDeleteConfirm()}>
                  {a("confirmDelete")}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
