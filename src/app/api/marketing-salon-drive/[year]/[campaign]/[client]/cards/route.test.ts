import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextResponse } from "next/server";

// Crear un mock de GoogleDriveService para usar en las pruebas
const mockGetFiles = vi.fn();
const mockConvertGoogleDriveLink = vi.fn();

// Mock para GoogleDriveService
vi.mock(
  "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService",
  () => {
    return {
      GoogleDriveService: vi.fn().mockImplementation(() => {
        return {
          getFiles: mockGetFiles,
          convertGoogleDriveLink: mockConvertGoogleDriveLink.mockImplementation(
            (fileId, mimeType) => {
              return {
                preview: `https://drive.google.com/file/d/${fileId}/preview`,
                imgEmbed: `https://drive.google.com/uc?id=${fileId}`,
                download: `https://drive.google.com/uc?export=download&id=${fileId}`,
                alternativeUrls: {
                  direct: `https://drive.google.com/uc?id=${fileId}`,
                  thumbnail: `https://drive.google.com/thumbnail?id=${fileId}`,
                  proxy: "",
                  video: mimeType?.startsWith("video/")
                    ? `https://drive.google.com/file/d/${fileId}/preview`
                    : undefined,
                },
              };
            }
          ),
        };
      }),
    };
  }
);

// Mock for NextResponse
vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: vi
        .fn()
        .mockImplementation((data, options) => ({ ...data, ...options })),
    },
  };
});

describe("Drive Cards API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configurar el comportamiento predeterminado para los mocks
    mockGetFiles.mockResolvedValue([]);
  });

  it("should return 400 if required parameters are missing", async () => {
    // Missing campaign parameter
    let request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023"
    );
    let result = await GET(request, { params: { year: "2023", campaign: "" } });

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Missing required parameters",
      }),
      { status: 400 }
    );

    // Missing year parameter
    request = new Request(
      "http://localhost:3000/api/marketing-salon-drive//january"
    );
    result = await GET(request, { params: { year: "", campaign: "january" } });

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Missing required parameters",
      }),
      { status: 400 }
    );
  });

  it("should process files and return sidebar structure with metadata", async () => {
    // Mock sample files response
    const mockFiles = [
      // File in root folder
      {
        id: "file1",
        name: "Root file.jpg",
        mimeType: "image/jpeg",
        webViewLink: "https://drive.google.com/file/d/file1/view",
        thumbnailLink: "https://drive.google.com/thumbnail?id=file1",
      },
      // File in subfolder
      {
        id: "file2",
        name: "Subfolder file.pdf",
        mimeType: "application/pdf",
        webViewLink: "https://drive.google.com/file/d/file2/view",
        thumbnailLink: "https://drive.google.com/thumbnail?id=file2",
        folder: "insiders",
        subFolder: "Archivos PDF",
      },
      // File in group folder
      {
        id: "file3",
        name: "Group file.mp4",
        mimeType: "video/mp4",
        webViewLink: "https://drive.google.com/file/d/file3/view",
        thumbnailLink: "https://drive.google.com/thumbnail?id=file3",
        folder: "insiders",
        subFolder: "Stories",
        subSubFolder: "group: Story 1",
      },
    ];

    // Setup mock response
    (mockGetFiles as any).mockResolvedValue(mockFiles);

    // Call API with parameters
    const request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023/january/insiders"
    );
    const result = await GET(request, {
      params: { year: "2023", campaign: "january", client: "insiders" },
    });

    // Verify the files were fetched
    expect(mockGetFiles).toHaveBeenCalledWith("2023/january/insiders");

    // Verify response structure
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          sidebar: expect.arrayContaining([
            expect.objectContaining({
              type: "sidebar-item",
              content: expect.objectContaining({
                tabs: expect.arrayContaining([
                  expect.objectContaining({
                    type: expect.stringMatching(/main|subfolder/),
                    content: expect.objectContaining({
                      files: expect.any(Array),
                    }),
                  }),
                ]),
              }),
            }),
          ]),
          metadata: expect.objectContaining({
            year: "2023",
            campaign: "january",
            client: "insiders",
            totalFiles: expect.any(Number),
            categoryStats: expect.any(Object),
          }),
        }),
      })
    );
  });

  it("should handle errors and return appropriate error responses", async () => {
    // Setup mock to throw an error
    (mockGetFiles as any).mockRejectedValue(
      new Error("Carpeta no encontrada: /2023/january/unknown")
    );

    // Call API with parameters
    const request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023/january/unknown"
    );
    await GET(request, {
      params: { year: "2023", campaign: "january", client: "unknown" },
    });

    // Verify error response for not found
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: "Carpeta no encontrada: /2023/january/unknown",
        details: "Carpeta no encontrada: /2023/january/unknown",
        path: "2023/january/unknown",
      },
      { status: 404 }
    );

    // Setup mock to throw another type of error
    (mockGetFiles as any).mockRejectedValue(new Error("credentials error"));

    // Call API again
    await GET(request, {
      params: { year: "2023", campaign: "january", client: "unknown" },
    });

    // Verify different error handling
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        error: "Authentication error with Google Drive",
        details: "credentials error",
        path: "2023/january/unknown",
      },
      { status: 401 }
    );
  });

  it("should correctly categorize files based on MIME types", async () => {
    // Mock files with different MIME types
    const mockFiles = [
      { id: "img1", name: "image.jpg", mimeType: "image/jpeg" },
      { id: "doc1", name: "document.pdf", mimeType: "application/pdf" },
      { id: "vid1", name: "video.mp4", mimeType: "video/mp4" },
      {
        id: "xls1",
        name: "spreadsheet.xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      {
        id: "ppt1",
        name: "presentation.pptx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    ];

    (mockGetFiles as any).mockResolvedValue(mockFiles);

    // Call API
    const request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023/january"
    );
    const result = await GET(request, {
      params: { year: "2023", campaign: "january" },
    });

    // Check that categories are correctly assigned in the response
    expect(result.data.metadata.categoryStats).toEqual(
      expect.objectContaining({
        image: 1,
        document: 1,
        video: 1,
        spreadsheet: 1,
        presentation: 1,
      })
    );
  });

  it("should correctly handle group folders and create grouped content", async () => {
    // Mock files in group folders
    const mockFiles = [
      // Files in Story 1 group
      {
        id: "story1file1",
        name: "CA1-image.jpg",
        mimeType: "image/jpeg",
        folder: "insiders",
        subFolder: "Stories",
        subSubFolder: "group: Story 1",
      },
      {
        id: "story1file2",
        name: "ES-image.jpg",
        mimeType: "image/jpeg",
        folder: "insiders",
        subFolder: "Stories",
        subSubFolder: "group: Story 1",
      },
      // Files in Story 2 group
      {
        id: "story2file1",
        name: "FR-image.jpg",
        mimeType: "image/jpeg",
        folder: "insiders",
        subFolder: "Stories",
        subSubFolder: "group: Story 2",
      },
    ];

    (mockGetFiles as any).mockResolvedValue(mockFiles);

    // Call API
    const request = new Request(
      "http://localhost:3000/api/marketing-salon-drive/2023/january/insiders"
    );
    const result = await GET(request, {
      params: { year: "2023", campaign: "january", client: "insiders" },
    });

    // Find the Stories tab in the insiders sidebar item
    const insidersSidebarItem = result.data.sidebar.find(
      (item: any) => item.name === "insiders"
    );
    const storiesTab = insidersSidebarItem?.content.tabs.find(
      (tab: any) => tab.name === "Stories"
    );

    // Verify groups are created correctly
    expect(storiesTab?.content.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Story 1",
          type: "group",
        }),
        expect.objectContaining({
          name: "Story 2",
          type: "group",
        }),
      ])
    );

    // Verify files are correctly assigned to groups
    const story1Group = storiesTab?.content.groups.find(
      (group: any) => group.name === "Story 1"
    );
    expect(story1Group?.content.files).toHaveLength(2);

    // Check that subfolder pattern detection works within groups
    expect(story1Group?.content.subTabs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "CA1",
          type: "subtab",
        }),
        expect.objectContaining({
          name: "ES",
          type: "subtab",
        }),
      ])
    );
  });
});
