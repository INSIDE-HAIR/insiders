import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import FolderDetailsPage from "../page";
import { http, HttpResponse } from "msw";
import { server } from "@/src/mocks/server";
import { useParams } from "next/navigation";
import { useNotifications } from "../../components/ui/Notifications";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

// Mock useNotifications hook
vi.mock("../../components/ui/Notifications", () => ({
  useNotifications: vi.fn(),
  Notifications: ({ notifications = [] }) => (
    <div data-testid="notifications">
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          data-testid={`notification-${notification.id}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const mockFolderDetails = {
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
};

describe("FolderDetailsPage", () => {
  const mockAddNotification = vi.fn().mockReturnValue("notification-id");
  const mockUpdateNotification = vi.fn();
  const mockDismissNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useParams
    (useParams as any).mockReturnValue({ id: "test-folder-id" });

    // Mock useNotifications with stable function references
    (useNotifications as any).mockReturnValue({
      addNotification: mockAddNotification,
      updateNotification: mockUpdateNotification,
      dismissNotification: mockDismissNotification,
    });

    // Mock fetch success response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "test-folder-id",
          name: "Test Folder",
          hierarchy: [],
        }),
    });

    server.use(
      http.get("/api/drive/folders/:id/hierarchy", () => {
        return HttpResponse.json(mockFolderDetails);
      })
    );
  });

  it("shows loading state initially", () => {
    render(<FolderDetailsPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows loading notification when fetching folder details", async () => {
    render(<FolderDetailsPage />);

    expect(mockAddNotification).toHaveBeenCalledWith(
      "loading",
      "Loading folder details..."
    );
  });

  it("shows success notification after loading folder details", async () => {
    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(mockUpdateNotification).toHaveBeenCalledWith(
        "notification-id",
        "success",
        "Folder details loaded successfully"
      );
    });
  });

  it("shows error notification when API call fails", async () => {
    server.use(
      http.get("/api/drive/folders/:id/hierarchy", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(mockUpdateNotification).toHaveBeenCalledWith(
        "notification-id",
        "error",
        "Failed to fetch folder details"
      );
    });
  });

  it("shows loading notification when clicking a document", async () => {
    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Document 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Document 1"));

    expect(mockAddNotification).toHaveBeenCalledWith(
      "loading",
      "Loading Document 1..."
    );
  });

  it("shows success notification after document loads", async () => {
    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Document 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Document 1"));

    await waitFor(() => {
      expect(mockUpdateNotification).toHaveBeenCalledWith(
        "notification-id",
        "success",
        "Document 1 loaded successfully"
      );
    });
  });

  it("renders folder details after loading", async () => {
    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Folder")).toBeInTheDocument();
      expect(screen.getByText("Document 1")).toBeInTheDocument();
      expect(screen.getByText("Subfolder")).toBeInTheDocument();
    });
  });

  it("renders back button that links to drive page", async () => {
    render(<FolderDetailsPage />);

    const backButton = screen.getByRole("link", { name: "Back to drive" });
    expect(backButton).toHaveAttribute("href", "/drive");
  });

  it("handles empty hierarchy gracefully", async () => {
    server.use(
      http.get("/api/drive/folders/:id/hierarchy", () => {
        return HttpResponse.json({
          id: "test-folder-id",
          name: "Empty Folder",
          hierarchy: [],
        });
      })
    );

    render(<FolderDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText("Empty Folder")).toBeInTheDocument();
    });
  });
});
