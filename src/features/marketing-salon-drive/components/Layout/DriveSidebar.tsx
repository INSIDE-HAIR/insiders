"use client";
import { SidebarItem } from "../../types/drive";

interface DriveSidebarProps {
  sidebarItems: SidebarItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

export function DriveSidebar({
  sidebarItems,
  selectedItemId,
  onSelectItem,
}: DriveSidebarProps) {
  return (
    <div className="bg-zinc-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Navegación</h2>
      <nav>
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelectItem(item.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedItemId === item.id
                    ? "bg-zinc-700 text-white font-medium"
                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
