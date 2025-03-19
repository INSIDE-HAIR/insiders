import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilePreview } from "../FilePreview";
import type { DriveItem } from "@drive/types/drive";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter",
  }),
}));

// Mock data
const mockDriveItem: DriveItem = {
  id: "1",
  name: "test-file",
  mimeType: "application/vnd.google-apps.document",
  webViewLink: "https://docs.google.com/document/d/1",
  iconLink:
    "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document",
  thumbnailLink: "https://drive.google.com/thumbnail?id=1",
  modifiedTime: "2024-03-18T21:51:50.014Z",
  size: "1000",
  parents: ["0"],
  isFolder: false,
  isShared: false,
  isStarred: false,
  isTrashed: false,
  permissions: [{ id: "1", type: "user", role: "owner" }],
};

describe("FilePreview", () => {
  it("should render Google Docs preview correctly", () => {
    const onClose = vi.fn();
    render(
      <FilePreview file={mockDriveItem} isOpen={true} onClose={onClose} />
    );
    expect(screen.getByTestId("google-workspace-preview")).toBeInTheDocument();
  });

  it("should render image preview correctly", () => {
    const imageItem = { ...mockDriveItem, mimeType: "image/jpeg" };
    const onClose = vi.fn();
    render(<FilePreview file={imageItem} isOpen={true} onClose={onClose} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("should render video preview correctly", () => {
    const videoItem = { ...mockDriveItem, mimeType: "video/mp4" };
    const onClose = vi.fn();
    render(<FilePreview file={videoItem} isOpen={true} onClose={onClose} />);
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("should render audio preview correctly", () => {
    const audioItem = { ...mockDriveItem, mimeType: "audio/mp3" };
    const onClose = vi.fn();
    render(<FilePreview file={audioItem} isOpen={true} onClose={onClose} />);
    expect(screen.getByTestId("audio-player")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <FilePreview file={mockDriveItem} isOpen={true} onClose={onClose} />
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
