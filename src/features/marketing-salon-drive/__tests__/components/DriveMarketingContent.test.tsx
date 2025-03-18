import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DriveMarketingContent } from "../../components/DriveMarketingContent";
import { useDriveCards } from "../../hooks/useDriveCards";
import { DriveApiResponse } from "../../types/drive";

// Mock the hooks module
vi.mock("../../hooks/useDriveCards");

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === "year") return "2023";
      if (param === "campaign") return "january";
      if (param === "client") return "insiders";
      return null;
    },
  }),
}));

// Mock the child components
vi.mock("../../components/Layout/DriveSidebar", () => ({
  DriveSidebar: ({ sidebarItems, selectedItemId, onSelectItem }: any) => (
    <div data-testid="mock-drive-sidebar">
      <span>Sidebar Items: {sidebarItems.length}</span>
      <button
        data-testid="sidebar-select-button"
        onClick={() => onSelectItem("sidebar-insiders")}
      >
        Select Item
      </button>
    </div>
  ),
}));

vi.mock("../../components/Layout/DriveHeader", () => ({
  DriveHeader: () => <div data-testid="mock-drive-header">Drive Header</div>,
}));

vi.mock("../../components/Layout/DriveContentArea", () => ({
  DriveContentArea: ({ sidebarItem, selectedTabId, onSelectTab }: any) => (
    <div data-testid="mock-drive-content-area">
      <span>Selected Tab: {selectedTabId}</span>
      <button
        data-testid="tab-select-button"
        onClick={() => onSelectTab("tab-insiders-principal")}
      >
        Select Tab
      </button>
    </div>
  ),
}));

// Mock API response
const mockSuccessResponse: DriveApiResponse = {
  success: true,
  data: {
    sidebar: [
      {
        id: "sidebar-insiders",
        name: "insiders",
        type: "sidebar-item",
        content: {
          tabs: [
            {
              id: "tab-insiders-principal",
              name: "Principal",
              type: "main",
              content: {
                files: [
                  {
                    id: "file1",
                    name: "Test File.jpg",
                    mimeType: "image/jpeg",
                    webViewLink: "https://example.com/file1",
                    transformedUrl: {
                      preview: "https://example.com/preview/file1",
                      imgEmbed: "https://example.com/embed/file1",
                      download: "https://example.com/download/file1",
                    },
                  },
                ],
                subTabs: [],
                groups: [],
              },
            },
          ],
        },
      },
    ],
    metadata: {
      year: "2023",
      campaign: "january",
      client: "insiders",
      totalFiles: 1,
      lastUpdated: "2023-01-01T00:00:00.000Z",
      categoryStats: {
        image: 1,
      },
    },
  },
};

describe("DriveMarketingContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    // Mock loading state
    (useDriveCards as any).mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    });

    render(<DriveMarketingContent />);

    // Should show loading spinner
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    // Mock error state
    const errorMessage = "Carpeta no encontrada";
    (useDriveCards as any).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null,
    });

    render(<DriveMarketingContent />);

    // Should show error message
    expect(
      screen.getByText(/Error cargando el contenido/i)
    ).toBeInTheDocument();

    // Should have retry button
    expect(screen.getByText("Intentar nuevamente")).toBeInTheDocument();
  });

  it("renders empty state correctly", () => {
    // Mock empty response
    (useDriveCards as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        success: true,
        data: {
          sidebar: [],
          metadata: {
            year: "2023",
            campaign: "january",
            client: "insiders",
            totalFiles: 0,
          },
        },
      },
    });

    render(<DriveMarketingContent />);

    // Should show empty state message
    expect(screen.getByText("No hay archivos disponibles")).toBeInTheDocument();
  });

  it("renders content correctly when data is available", async () => {
    // Mock successful response
    (useDriveCards as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockSuccessResponse,
    });

    render(<DriveMarketingContent />);

    // Should render child components
    expect(screen.getByTestId("mock-drive-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-drive-sidebar")).toBeInTheDocument();

    // Should show the sidebar items count
    expect(screen.getByText("Sidebar Items: 1")).toBeInTheDocument();

    // Wait for the component to set default selections
    await waitFor(() => {
      expect(screen.getByTestId("mock-drive-content-area")).toBeInTheDocument();
    });
  });

  it("handles item and tab selection correctly", async () => {
    // Mock successful response
    (useDriveCards as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockSuccessResponse,
    });

    render(<DriveMarketingContent />);

    // Initial render should set default selections
    await waitFor(() => {
      expect(screen.getByTestId("mock-drive-content-area")).toBeInTheDocument();
    });

    // Test sidebar item selection
    const sidebarSelectButton = screen.getByTestId("sidebar-select-button");
    sidebarSelectButton.click();

    // Test tab selection
    const tabSelectButton = screen.getByTestId("tab-select-button");
    tabSelectButton.click();

    // After selecting, should show selected tab ID
    expect(
      screen.getByText("Selected Tab: tab-insiders-principal")
    ).toBeInTheDocument();
  });
});
