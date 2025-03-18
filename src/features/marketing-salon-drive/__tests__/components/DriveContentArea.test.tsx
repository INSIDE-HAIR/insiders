import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DriveContentArea } from "../../components/Layout/DriveContentArea";
import { SidebarItem, TabItem, GroupItem, DriveFile } from "../../types/drive";

// Mock the UI components
vi.mock("@/src/components/ui/tabs", () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="mock-tabs" data-value={value}>
      {children}
      <button
        data-testid="tab-change-trigger"
        onClick={() => onValueChange && onValueChange("tab2")}
      >
        Change Tab
      </button>
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="mock-tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

// Mock the DriveCardGrid component
vi.mock("../../components/Cards/DriveCardGrid", () => ({
  DriveCardGrid: ({ files, onPreviewClick }: any) => (
    <div data-testid="mock-drive-card-grid">
      {files.map((file: any) => (
        <button
          key={file.id}
          onClick={() => onPreviewClick(file)}
          data-testid={`file-${file.id}`}
        >
          {file.name}
        </button>
      ))}
    </div>
  ),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  FolderOpenIcon: () => <div data-testid="mock-folder-icon">📁</div>,
}));

// Mock data
const mockFile: DriveFile = {
  id: "file1",
  name: "Test File.jpg",
  mimeType: "image/jpeg",
  webViewLink: "https://example.com/file1",
  transformedUrl: {
    preview: "https://example.com/preview/file1",
    imgEmbed: "https://example.com/embed/file1",
    download: "https://example.com/download/file1",
  },
};

const mockGroupFile: DriveFile = {
  id: "file2",
  name: "Group File.pdf",
  mimeType: "application/pdf",
  webViewLink: "https://example.com/file2",
  transformedUrl: {
    preview: "https://example.com/preview/file2",
    imgEmbed: "https://example.com/embed/file2",
    download: "https://example.com/download/file2",
  },
};

const mockSubTabFile: DriveFile = {
  id: "file3",
  name: "SubTab File.mp4",
  mimeType: "video/mp4",
  webViewLink: "https://example.com/file3",
  transformedUrl: {
    preview: "https://example.com/preview/file3",
    imgEmbed: "https://example.com/embed/file3",
    download: "https://example.com/download/file3",
  },
};

// Create mock group
const mockGroup: GroupItem = {
  id: "group1",
  name: "Test Group",
  type: "group",
  content: {
    files: [mockGroupFile],
    subTabs: [],
    groups: [],
  },
};

// Create mock tabs
const mockTabs: TabItem[] = [
  {
    id: "tab1",
    name: "Principal",
    type: "main",
    content: {
      files: [mockFile],
      subTabs: [],
      groups: [mockGroup], // Add the group to the Principal tab
    },
  },
  {
    id: "tab2",
    name: "Regular Tab",
    type: "subfolder",
    content: {
      files: [],
      subTabs: [],
      groups: [],
    },
  },
  {
    id: "tab3",
    name: "With SubTabs",
    type: "subfolder",
    content: {
      files: [],
      subTabs: [
        {
          id: "subtab1",
          name: "Sub Tab",
          type: "subtab",
          content: {
            files: [mockSubTabFile],
            subTabs: [],
            groups: [],
          },
        },
      ],
      groups: [],
    },
  },
];

// Add a tab that should be filtered out (a group entry that shouldn't be shown as a tab)
const mockTabsWithGroup = [...mockTabs, 
  {
    id: "group-tab",
    name: "group: This is a group",
    type: "group",
    content: {
      files: [],
      subTabs: [],
      groups: [],
    },
  }
];

// Create mock sidebar item
const mockSidebarItem: SidebarItem = {
  id: "sidebar1",
  name: "Test Sidebar",
  type: "sidebar-item",
  content: {
    tabs: mockTabsWithGroup,
  },
};

describe("DriveContentArea", () => {
  it("renders the sidebar item name correctly", () => {
    const onSelectTabMock = vi.fn();

    render(
      <DriveContentArea
        sidebarItem={mockSidebarItem}
        selectedTabId="tab1"
        onSelectTab={onSelectTabMock}
      />
    );

    expect(screen.getByText("Test Sidebar")).toBeInTheDocument();
  });

  it("filters out group tabs from the main tab navigation", () => {
    const onSelectTabMock = vi.fn();

    render(
      <DriveContentArea
        sidebarItem={mockSidebarItem}
        selectedTabId="tab1"
        onSelectTab={onSelectTabMock}
      />
    );

    // These tabs should be rendered
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByText("Regular Tab")).toBeInTheDocument();
    expect(screen.getByText("With SubTabs")).toBeInTheDocument();

    // This group should NOT be rendered as a tab
    expect(screen.queryByText("group: This is a group")).not.toBeInTheDocument();
    expect(screen.queryByText("This is a group")).not.toBeInTheDocument();
  });

  it("renders groups as sections within tab content", () => {
    const onSelectTabMock = vi.fn();

    render(
      <DriveContentArea
        sidebarItem={mockSidebarItem}
        selectedTabId="tab1"
        onSelectTab={onSelectTabMock}
      />
    );

    // Principal tab is selected, it should show the file and the group
    expect(screen.getByText("Test File.jpg")).toBeInTheDocument();
    
    // The group should be rendered as a section within the tab
    expect(screen.getByText("Test Group")).toBeInTheDocument();
    expect(screen.getByText("Group File.pdf")).toBeInTheDocument();
  });

  it("calls onSelectTab when a tab is changed", () => {
    const onSelectTabMock = vi.fn();

    render(
      <DriveContentArea
        sidebarItem={mockSidebarItem}
        selectedTabId="tab1"
        onSelectTab={onSelectTabMock}
      />
    );

    // Get all tab change buttons and click the first one (at the top level)
    const tabChangeButtons = screen.getAllByTestId("tab-change-trigger");
    fireEvent.click(tabChangeButtons[tabChangeButtons.length - 1]); // Get the last one which is the main tab change button

    // Check that onSelectTab was called with the correct ID
    expect(onSelectTabMock).toHaveBeenCalledWith("tab2");
  });

  it("renders correctly for a sidebar with no tabs", () => {
    const onSelectTabMock = vi.fn();
    const emptySidebarItem: SidebarItem = {
      id: "sidebar-empty",
      name: "Empty Sidebar",
      type: "sidebar-item",
      content: {
        tabs: [],
      },
    };

    render(
      <DriveContentArea
        sidebarItem={emptySidebarItem}
        selectedTabId={null}
        onSelectTab={onSelectTabMock}
      />
    );

    // Should show an empty state message
    expect(screen.getByText("No hay contenido disponible")).toBeInTheDocument();
  });
});
