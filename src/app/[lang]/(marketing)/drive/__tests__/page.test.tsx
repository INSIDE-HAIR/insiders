import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DrivePage from "../page";
import { server } from "@/src/mocks/server";
import { http, HttpResponse } from "msw";
import { useRouter } from "next/navigation";

// Mock data
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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("DrivePage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it("renders the page title", () => {
    render(<DrivePage />);
    expect(screen.getByText("Drive Explorer")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<DrivePage />);
    expect(
      screen.getByPlaceholderText("Search folders...")
    ).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<DrivePage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays folders after loading", async () => {
    render(<DrivePage />);

    await waitFor(() => {
      expect(screen.getByText("Test Folder 1")).toBeInTheDocument();
      expect(screen.getByText("Test Folder 2")).toBeInTheDocument();
    });
  });

  it("filters folders when searching", async () => {
    render(<DrivePage />);

    const searchInput = screen.getByPlaceholderText("Search folders...");
    fireEvent.change(searchInput, { target: { value: "1" } });
    fireEvent.keyPress(searchInput, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Test Folder 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Folder 2")).not.toBeInTheDocument();
    });
  });

  it("displays error message when API call fails", async () => {
    server.use(
      http.get("/api/drive/folders", () => {
        return HttpResponse.json(
          { message: "Internal Server Error" },
          { status: 500 }
        );
      })
    );

    render(<DrivePage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch folders")).toBeInTheDocument();
    });
  });

  it("navigates to folder details when clicking a folder", async () => {
    render(<DrivePage />);

    await waitFor(() => {
      expect(screen.getByText("Test Folder 1")).toBeInTheDocument();
    });

    const folderElement = screen.getByText("Test Folder 1").closest("div");
    fireEvent.click(folderElement!);

    expect(mockPush).toHaveBeenCalledWith("/drive/1");
  });
});
