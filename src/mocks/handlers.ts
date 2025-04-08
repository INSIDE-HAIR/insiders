import { http, HttpResponse } from "msw";

const mockFolders = [
  {
    id: "1",
    name: "Test Folder 1",
    mimeType: "application/vnd.google-apps.folder",
    modifiedTime: "2024-03-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Test Folder 2",
    mimeType: "application/vnd.google-apps.folder",
    modifiedTime: "2024-03-20T11:00:00Z",
  },
];

export const handlers = [
  http.get("/api/drive/folders", () => {
    return HttpResponse.json(mockFolders);
  }),

  http.get("/api/drive/folders/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const filteredFolders = mockFolders.filter((folder) =>
      folder.name.toLowerCase().includes(query.toLowerCase())
    );
    return HttpResponse.json(filteredFolders);
  }),

  http.get("/api/drive/folders/:id", ({ params }) => {
    const { id } = params;
    const folder = mockFolders.find((f) => f.id === id);

    if (!folder) {
      return HttpResponse.json(
        { message: "Folder not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(folder);
  }),

  http.get("/api/drive/explorer/folder/:id", () => {
    return HttpResponse.json({
      id: "test-folder-id",
      name: "Test Folder",
      hierarchy: [
        {
          id: "1",
          name: "Document 1",
          type: "document",
        },
        {
          id: "2",
          name: "Subfolder",
          type: "folder",
          children: [
            {
              id: "3",
              name: "Document 2",
              type: "document",
            },
          ],
        },
      ],
    });
  }),
];
