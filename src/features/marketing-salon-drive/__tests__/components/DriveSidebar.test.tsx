import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DriveSidebar } from "../../components/Layout/DriveSidebar";
import { SidebarItem } from "../../types/drive";

// Mock data
const mockSidebarItems: SidebarItem[] = [
  {
    id: "sidebar-insiders",
    name: "Insiders",
    type: "sidebar-item",
    content: {
      tabs: [],
    },
  },
  {
    id: "sidebar-campaign",
    name: "Campaign Materials",
    type: "sidebar-item",
    content: {
      tabs: [],
    },
  },
];

describe("DriveSidebar", () => {
  it("renders sidebar items correctly", () => {
    // Setup mock function
    const onSelectItemMock = vi.fn();

    // Render component
    render(
      <DriveSidebar
        sidebarItems={mockSidebarItems}
        selectedItemId={null}
        onSelectItem={onSelectItemMock}
      />
    );

    // Check sidebar title is rendered
    expect(screen.getByText("Navegación")).toBeInTheDocument();

    // Check if items are rendered
    expect(screen.getByText("Insiders")).toBeInTheDocument();
    expect(screen.getByText("Campaign Materials")).toBeInTheDocument();
  });

  it("applies selected styles to selected item", () => {
    const onSelectItemMock = vi.fn();

    // Render with selected item
    render(
      <DriveSidebar
        sidebarItems={mockSidebarItems}
        selectedItemId="sidebar-insiders"
        onSelectItem={onSelectItemMock}
      />
    );

    // Get all buttons
    const buttons = screen.getAllByRole("button");

    // Check that the first button has the selected class (checking for text color)
    expect(buttons[0]).toHaveClass("bg-zinc-700");
    expect(buttons[0]).toHaveClass("text-white");

    // Second button should not have selected class
    expect(buttons[1]).not.toHaveClass("bg-zinc-700");
    expect(buttons[1]).toHaveClass("text-zinc-400");
  });

  it("calls onSelectItem when an item is clicked", () => {
    const onSelectItemMock = vi.fn();

    // Render component
    render(
      <DriveSidebar
        sidebarItems={mockSidebarItems}
        selectedItemId={null}
        onSelectItem={onSelectItemMock}
      />
    );

    // Click on the first item
    fireEvent.click(screen.getByText("Insiders"));

    // Check if the mock function was called with the correct ID
    expect(onSelectItemMock).toHaveBeenCalledWith("sidebar-insiders");

    // Click on the second item
    fireEvent.click(screen.getByText("Campaign Materials"));

    // Check if the mock function was called with the correct ID
    expect(onSelectItemMock).toHaveBeenCalledWith("sidebar-campaign");
  });

  it("renders empty state correctly", () => {
    const onSelectItemMock = vi.fn();

    // Render with empty items array
    render(
      <DriveSidebar
        sidebarItems={[]}
        selectedItemId={null}
        onSelectItem={onSelectItemMock}
      />
    );

    // Should still show the title
    expect(screen.getByText("Navegación")).toBeInTheDocument();

    // But no items should be rendered
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });
});
