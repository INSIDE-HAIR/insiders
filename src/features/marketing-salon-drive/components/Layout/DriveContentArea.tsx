"use client";
import { SidebarItem, DriveFile, TabItem, GroupItem } from "../../types/drive";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs";
import { useId } from "react";
import { DriveCardGrid } from "../Cards/DriveCardGrid";
import { FolderOpenIcon } from "lucide-react";

interface DriveContentAreaProps {
  sidebarItem: SidebarItem;
  selectedTabId: string | null;
  onSelectTab: (tabId: string) => void;
}

export function DriveContentArea({
  sidebarItem,
  selectedTabId,
  onSelectTab,
}: DriveContentAreaProps) {
  // Generate a unique ID for this instance
  const instanceId = useId();

  // Track active tab
  const [activeTab, setActiveTab] = useState<string | null>(selectedTabId);

  // File preview state
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Update internal state when props change
  if (selectedTabId !== activeTab) {
    setActiveTab(selectedTabId);
  }

  // Get current tab
  const currentTab = sidebarItem.content.tabs.find(
    (tab) => tab.id === activeTab
  );

  // Handle tab selection
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onSelectTab(value);
  };

  // Handle file preview
  const handlePreviewClick = (file: DriveFile) => {
    setPreviewFile(file);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  if (!sidebarItem.content.tabs.length) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No hay contenido disponible</p>
      </div>
    );
  }

  // Filter out group identifiers from tab names for display
  const getDisplayName = (name: string) => {
    if (name.startsWith("group:")) {
      return name.substring(6).trim();
    }
    if (name.startsWith("grupo:")) {
      return name.substring(6).trim();
    }
    if (name.startsWith("grouptitle:")) {
      return name.substring(11).trim();
    }
    return name;
  };

  // Extract only real tabs (not groups) for the top-level tab navigation
  const mainTabs = sidebarItem.content.tabs.filter(
    (tab) => !tab.name.toLowerCase().startsWith("group:")
  );

  return (
    <div className="bg-zinc-900 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {sidebarItem.name}
      </h2>

      {/* Tabs navigation - only show real tabs, not groups */}
      <Tabs
        value={activeTab || undefined}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6 flex-wrap overflow-auto [&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:text-black">
          {mainTabs.map((tab) => (
            <TabsTrigger
              key={`${instanceId}-tab-${tab.id}`}
              value={tab.id}
              className="rounded-none bg-zinc-700 text-white border-none"
            >
              {getDisplayName(tab.name)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content */}
        {mainTabs.map((tab) => (
          <TabsContent
            key={`${instanceId}-content-${tab.id}`}
            value={tab.id}
            className="w-full"
          >
            <TabContent tab={tab} onPreviewClick={handlePreviewClick} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{previewFile.name}</h3>
              <button
                onClick={handleClosePreview}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {previewFile.mimeType?.startsWith("image/") && (
                <img
                  src={previewFile.transformedUrl?.imgEmbed}
                  alt={previewFile.name}
                  className="max-w-full mx-auto"
                />
              )}
              {previewFile.mimeType?.startsWith("video/") && (
                <div className="aspect-video">
                  <iframe
                    src={previewFile.transformedUrl?.preview}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}
              {previewFile.mimeType?.includes("pdf") && (
                <div className="aspect-[4/3] min-h-[50vh]">
                  <iframe
                    src={previewFile.transformedUrl?.preview}
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <a
                  href={previewFile.transformedUrl?.download}
                  download
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Descargar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TabContentProps {
  tab: TabItem;
  onPreviewClick: (file: DriveFile) => void;
}

function TabContent({ tab, onPreviewClick }: TabContentProps) {
  // Create a filter function to identify groups within a tab
  const isGroup = (name: string) => {
    const lowerName = name.toLowerCase();
    return (
      lowerName.startsWith("group:") ||
      lowerName.startsWith("grupo:") ||
      lowerName.startsWith("grouptitle:")
    );
  };

  // Generate a clean display name without prefix
  const getCleanName = (name: string) => {
    if (name.toLowerCase().startsWith("group:")) {
      return name.substring(6).trim();
    }
    if (name.toLowerCase().startsWith("grupo:")) {
      return name.substring(6).trim();
    }
    if (name.toLowerCase().startsWith("grouptitle:")) {
      return name.substring(11).trim();
    }
    return name;
  };

  // First render the tab's direct files if any
  const hasFiles = tab.content.files && tab.content.files.length > 0;

  // Then render groups
  const hasGroups = tab.content.groups && tab.content.groups.length > 0;

  // Then check for subtabs
  const hasSubTabs = tab.content.subTabs && tab.content.subTabs.length > 0;

  if (!hasFiles && !hasGroups && !hasSubTabs) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <div className="tab-content-container">
      {/* First render the tab's direct files */}
      {hasFiles && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-center text-white">
            {tab.name === "Principal"
              ? "Archivos principales"
              : `Archivos en ${tab.name}`}
          </h3>
          <DriveCardGrid
            files={tab.content.files}
            onPreviewClick={onPreviewClick}
          />
        </div>
      )}

      {/* Then render groups within this tab */}
      {hasGroups && (
        <div className="tab-groups-container">
          {tab.content.groups.map((group) => (
            <GroupContent
              key={group.id}
              group={group}
              onPreviewClick={onPreviewClick}
            />
          ))}
        </div>
      )}

      {/* Render subtabs if any */}
      {hasSubTabs && (
        <SubTabsContent
          subTabs={tab.content.subTabs}
          onPreviewClick={onPreviewClick}
        />
      )}
    </div>
  );
}

interface SubTabsContentProps {
  subTabs: TabItem[];
  onPreviewClick: (file: DriveFile) => void;
}

function SubTabsContent({ subTabs, onPreviewClick }: SubTabsContentProps) {
  const instanceId = useId();
  const [activeSubTab, setActiveSubTab] = useState<string>(subTabs[0].id);

  // Group subtabs by type for better organization
  const folderSubTabs = subTabs.filter(
    (tab) => tab.type === "subfolder-in-group" || tab.type === "subfolder"
  );

  const patternSubTabs = subTabs.filter(
    (tab) => tab.type === "pattern-based-tab" || tab.type === "subtab"
  );

  // If we have both types, show them differently
  const hasBothTypes = folderSubTabs.length > 0 && patternSubTabs.length > 0;

  // If we only have pattern-based tabs or only folder-based tabs, show all as tabs
  const tabsToShow = hasBothTypes ? folderSubTabs : subTabs;

  return (
    <div className="mt-8">
      {/* Show navigable tabs */}
      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="mb-4 [&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:text-black">
          {tabsToShow.map((subTab) => (
            <TabsTrigger
              key={`${instanceId}-subtab-${subTab.id}`}
              value={subTab.id}
              className="rounded-none bg-zinc-700 text-white border-none"
            >
              {subTab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabsToShow.map((subTab) => (
          <TabsContent
            key={`${instanceId}-subtab-content-${subTab.id}`}
            value={subTab.id}
            className="w-full"
          >
            <TabContent tab={subTab} onPreviewClick={onPreviewClick} />
          </TabsContent>
        ))}
      </Tabs>

      {/* If we have both types, show pattern-based tabs as sections under folder tabs */}
      {hasBothTypes && patternSubTabs.length > 0 && (
        <div className="mt-6 border-t border-zinc-700 pt-4">
          <h4 className="text-base font-medium text-white mb-3">
            Secciones adicionales
          </h4>
          <div className="ml-4 border-l-2 border-[#B9F264] pl-4">
            {patternSubTabs.map((subTab) => (
              <div key={subTab.id} className="mb-4">
                <h4 className="font-medium text-[#B9F264] mb-2">
                  {subTab.name}
                </h4>
                <div className="ml-2">
                  <TabContent tab={subTab} onPreviewClick={onPreviewClick} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface GroupContentProps {
  group: GroupItem;
  onPreviewClick: (file: DriveFile) => void;
}

function GroupContent({ group, onPreviewClick }: GroupContentProps) {
  // Get clean group name without any prefix
  const groupName = group.name.toLowerCase().startsWith("group:")
    ? group.name.substring(6).trim()
    : group.name.toLowerCase().startsWith("grupo:")
    ? group.name.substring(6).trim()
    : group.name.toLowerCase().startsWith("grouptitle:")
    ? group.name.substring(11).trim()
    : group.name;

  // Check if we have subtabs
  const hasSubTabs = group.content.subTabs && group.content.subTabs.length > 0;

  // All subtabs should be shown as tabs
  const allSubTabs = hasSubTabs ? group.content.subTabs : [];

  // Check if we have nested groups
  const hasNestedGroups =
    group.content.groups && group.content.groups.length > 0;

  // Ensure we have direct files
  const hasDirectFiles = group.content.files && group.content.files.length > 0;

  // ID for tabs
  const instanceId = useId();

  // Check if we already have a "Principal" tab among subtabs
  const existingPrincipalTab = allSubTabs.find(
    (tab) => tab.name.toLowerCase() === "principal"
  );

  // Create a "Principal" tab if we have direct files and no existing Principal tab
  // Only create this virtual tab if there are other tabs too
  const shouldCreatePrincipalTab =
    !existingPrincipalTab && hasDirectFiles && allSubTabs.length > 0;

  const principalTab = shouldCreatePrincipalTab
    ? {
        id: `${group.id}-principal`,
        name: "Principal",
        type: "virtual-tab",
        content: {
          files: group.content.files || [],
          subTabs: [],
          groups: [],
        },
      }
    : null;

  // Combine principal tab with other subtabs if needed
  let tabsToShow = [...allSubTabs];
  if (principalTab) {
    tabsToShow = [principalTab, ...tabsToShow];
  }

  // State for active tab - default to first tab
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (!tabsToShow.length) return null;

    // Try to find a "Principal" tab
    const principalTabInList = tabsToShow.find(
      (tab) => tab.name.toLowerCase() === "principal"
    );

    return principalTabInList ? principalTabInList.id : tabsToShow[0].id;
  });

  return (
    <div className="mb-8 p-4 border border-zinc-700 rounded-lg">
      <div className="flex items-center mb-4">
        <FolderOpenIcon className="h-5 w-5 mr-2 text-[#B9F264]" />
        <h3 className="text-lg font-medium text-white">{groupName}</h3>
      </div>

      {/* Always show tabs if we have subtabs */}
      {tabsToShow.length > 0 ? (
        <Tabs
          value={activeTab || undefined}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 [&>[data-state=active]]:bg-[#B9F264] [&>[data-state=active]]:text-black">
            {tabsToShow.map((tab) => (
              <TabsTrigger
                key={`${instanceId}-tab-${tab.id}`}
                value={tab.id}
                className="rounded-none bg-zinc-700 text-white border-none"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsToShow.map((tab) => (
            <TabsContent
              key={`${instanceId}-content-${tab.id}`}
              value={tab.id}
              className="w-full"
            >
              <div className="p-2">
                {/* Render files */}
                {tab.content.files && tab.content.files.length > 0 && (
                  <DriveCardGrid
                    files={tab.content.files}
                    onPreviewClick={onPreviewClick}
                  />
                )}

                {/* If this tab has nested content, recursively render it */}
                {tab.content.groups && tab.content.groups.length > 0 && (
                  <div className="mt-4">
                    {tab.content.groups.map((nestedGroup) => (
                      <GroupContent
                        key={nestedGroup.id}
                        group={nestedGroup}
                        onPreviewClick={onPreviewClick}
                      />
                    ))}
                  </div>
                )}

                {/* If this tab has its own subtabs, render them */}
                {tab.content.subTabs && tab.content.subTabs.length > 0 && (
                  <div className="mt-4">
                    <SubTabsContent
                      subTabs={tab.content.subTabs}
                      onPreviewClick={onPreviewClick}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        /* Only if there are no subtabs, show files directly */
        hasDirectFiles && (
          <div className="mb-4">
            <DriveCardGrid
              files={group.content.files}
              onPreviewClick={onPreviewClick}
            />
          </div>
        )
      )}

      {/* Nested groups if any */}
      {hasNestedGroups && (
        <div className="mt-6 border-t border-zinc-700 pt-4">
          <h4 className="text-base font-medium text-white mb-3">
            Subgrupos en: {groupName}
          </h4>
          {group.content.groups.map((nestedGroup) => (
            <div key={nestedGroup.id} className="ml-4">
              <GroupContent
                group={nestedGroup}
                onPreviewClick={onPreviewClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
