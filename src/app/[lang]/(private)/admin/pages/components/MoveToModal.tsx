import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { DynamicPage } from "@prisma/client";
import { useTranslations } from "@/src/context/TranslationContext";

interface MoveToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetParentId: string) => void;
  pages: DynamicPage[];
  currentPage: DynamicPage | null;
}

export function MoveToModal({
  isOpen,
  onClose,
  onMove,
  pages,
  currentPage,
}: MoveToModalProps) {
  const [selectedParentId, setSelectedParentId] = React.useState<string>("");
  const t = useTranslations("PageCreator");
  const f = useTranslations("PageCreator.form");
  const a = useTranslations("PageCreator.actions");

  const renderSelectOptions = (
    pages: DynamicPage[],
    level: number = 0
  ): React.ReactElement[] => {
    return pages
      .filter((page) => page.id !== currentPage?.id)
      .map((page) => (
        <SelectItem key={page.id} value={page.id}>
          {"\u00A0".repeat(level * 2)}
          {page.title}
        </SelectItem>
      ));
  };

  const handleMove = () => {
    if (selectedParentId) {
      onMove(selectedParentId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("moveToTitle")}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Select onValueChange={setSelectedParentId} value={selectedParentId}>
            <SelectTrigger>
              <SelectValue placeholder={f("selectParentPage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='root'>{f("noParent")}</SelectItem>
              {renderSelectOptions(pages)}
            </SelectContent>
          </Select>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose}>
              {a("cancel")}
            </Button>
            <Button onClick={handleMove} disabled={!selectedParentId}>
              {a("move")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
