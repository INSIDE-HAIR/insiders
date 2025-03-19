import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HierarchyViewer } from "../HierarchyViewer";

describe("HierarchyViewer", () => {
  const mockHierarchy = {
    id: "1",
    name: "Root Folder",
    type: "folder",
    children: [
      {
        id: "2",
        name: "Tab Section",
        type: "tab",
      },
      {
        id: "4",
        name: "Accordion Section",
        type: "accordion",
      },
      {
        id: "3",
        name: "Regular Folder",
        type: "folder",
        children: [
          {
            id: "5",
            name: "Document 3",
            type: "document",
          },
        ],
      },
    ],
  };

  const mockOnItemClick = vi.fn();

  it("renders the hierarchy structure", () => {
    render(<HierarchyViewer hierarchy={mockHierarchy} />);
    const rootFolder = screen.getByText("Root Folder");
    expect(rootFolder).toBeInTheDocument();
    fireEvent.click(rootFolder);
    expect(screen.getByText("Tab Section")).toBeInTheDocument();
    expect(screen.getByText("Accordion Section")).toBeInTheDocument();
  });

  it("expands and collapses folders on click", () => {
    render(
      <HierarchyViewer
        hierarchy={mockHierarchy}
        onItemClick={mockOnItemClick}
      />
    );

    // Click root folder to expand
    const rootFolder = screen.getByText("Root Folder");
    fireEvent.click(rootFolder);

    // Click regular folder to expand
    const regularFolder = screen.getByText("Regular Folder");
    fireEvent.click(regularFolder);
    expect(screen.getByText("Document 3")).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(regularFolder);
    expect(screen.queryByText("Document 3")).not.toBeInTheDocument();
  });

  it("renders tabs correctly", () => {
    render(<HierarchyViewer hierarchy={mockHierarchy} />);
    const rootFolder = screen.getByText("Root Folder");
    fireEvent.click(rootFolder);
    const tabSection = screen.getByTestId("item-tab");
    expect(tabSection).toBeInTheDocument();
    expect(tabSection).toHaveTextContent("Tab Section");
  });

  it("renders accordions correctly", () => {
    render(<HierarchyViewer hierarchy={mockHierarchy} />);
    const rootFolder = screen.getByText("Root Folder");
    fireEvent.click(rootFolder);
    const accordionSection = screen.getByTestId("item-accordion");
    expect(accordionSection).toBeInTheDocument();
    expect(accordionSection).toHaveTextContent("Accordion Section");
  });

  it("calls onItemClick when clicking an item", () => {
    render(
      <HierarchyViewer
        hierarchy={mockHierarchy}
        onItemClick={mockOnItemClick}
      />
    );
    const rootFolder = screen.getByText("Root Folder");
    fireEvent.click(rootFolder);
    expect(mockOnItemClick).toHaveBeenCalledWith(mockHierarchy);
  });

  it("maintains expanded state correctly", () => {
    render(<HierarchyViewer hierarchy={mockHierarchy} />);

    // Expand root folder
    const rootFolder = screen.getByText("Root Folder");
    fireEvent.click(rootFolder);

    // Verify children are visible
    expect(screen.getByText("Tab Section")).toBeInTheDocument();
    expect(screen.getByText("Accordion Section")).toBeInTheDocument();
    expect(screen.getByText("Regular Folder")).toBeInTheDocument();

    // Expand regular folder
    const regularFolder = screen.getByText("Regular Folder");
    fireEvent.click(regularFolder);

    // Verify nested document is visible
    expect(screen.getByText("Document 3")).toBeInTheDocument();

    // Collapse regular folder
    fireEvent.click(regularFolder);

    // Verify nested document is hidden but other items remain visible
    expect(screen.queryByText("Document 3")).not.toBeInTheDocument();
    expect(screen.getByText("Tab Section")).toBeInTheDocument();
    expect(screen.getByText("Accordion Section")).toBeInTheDocument();
  });

  it("handles empty hierarchy gracefully", () => {
    const emptyHierarchy = {
      id: "1",
      name: "Empty Folder",
      type: "folder",
      children: [],
    };
    render(<HierarchyViewer hierarchy={emptyHierarchy} />);
    expect(screen.getByText("Empty Folder")).toBeInTheDocument();
  });
});
