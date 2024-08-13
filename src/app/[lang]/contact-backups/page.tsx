// app/contact-backups/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactBackup } from "@prisma/client";
import { DataTable } from "./components/DataTable";
import { columns } from "./components/columns";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  getCountdown,
  getNextDailyBackupTime,
  getNextHourlyUpdateTime,
} from "@/src/lib/utils/countdownTimer";

export default function ContactBackupsPage() {
  const [favoriteBackups, setFavoriteBackups] = useState<ContactBackup[]>([]);
  const [dailyBackups, setDailyBackups] = useState<ContactBackup[]>([]);
  const [currentBackup, setCurrentBackup] = useState<ContactBackup | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<ContactBackup | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<ContactBackup | null>(
    null
  );
  const [favoritePageSize, setFavoritePageSize] = useState(5);
  const [dailyPageSize, setDailyPageSize] = useState(5);
  const [dailyCountdown, setDailyCountdown] = useState("");
  const [currentCountdown, setCurrentCountdown] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchBackups = useCallback(
    async (page = 1, pageSize = 5) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/contact-backups?page=${page}&pageSize=${pageSize}`
        );
        const data = await response.json();
        setFavoriteBackups(data.favoriteBackups);
        setDailyBackups(data.dailyBackups);
        setCurrentBackup(data.currentBackup);
        setTotalPages(Math.ceil(data.totalCount / pageSize));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch backups",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchBackups(currentPage, favoritePageSize);
  }, [currentPage, favoritePageSize, fetchBackups]);

  useEffect(() => {
    fetchBackups();
    const intervalId = setInterval(() => {
      const nextDaily = getNextDailyBackupTime();
      const nextHourly = getNextHourlyUpdateTime();
      setDailyCountdown(getCountdown(nextDaily));
      setCurrentCountdown(getCountdown(nextHourly));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchBackups]);

  const toggleFavorite = async (backup: ContactBackup) => {
    if (!backup.isFavorite && favoriteBackups.length >= 5) {
      toast({
        title: "Error",
        description: "Maximum number of favorites reached (5)",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/contact-backups/${backup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !backup.isFavorite }),
      });
      if (response.ok) {
        await fetchBackups(); // Refresh all backups
        toast({
          title: "Success",
          description: `Backup ${
            backup.isFavorite ? "removed from" : "added to"
          } favorites`,
        });
      } else {
        throw new Error("Failed to update backup");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update backup",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (backup: ContactBackup) => {
    setBackupToDelete(backup);
    setIsDeleteDialogOpen(true);
  };

  const deleteBackup = async () => {
    if (!backupToDelete) return;

    try {
      const response = await fetch(
        `/api/contact-backups/${backupToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        await fetchBackups(); // Refresh all backups
        toast({
          title: "Success",
          description: "Backup deleted successfully",
        });
      } else {
        throw new Error("Failed to delete backup");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setBackupToDelete(null);
    }
  };

  const updateCurrentBackup = async () => {
    try {
      const response = await fetch("/api/contact-backups/current", {
        method: "POST",
      });
      if (response.ok) {
        const updatedBackup = await response.json();
        setCurrentBackup(updatedBackup);
        toast({
          title: "Success",
          description: "Current backup updated successfully",
        });
      } else {
        throw new Error("Failed to update current backup");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update current backup",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Contact Backups</h1>

      <h2 className="text-xl font-semibold mb-3">Current Backup</h2>
      <div className="mb-5">
        <p>Next automatic update in: {currentCountdown}</p>
        <Button onClick={updateCurrentBackup} className="mt-2">
          Update Now
        </Button>

        {/* Current Backup Table */}
        {currentBackup && (
          <DataTable
            columns={columns}
            data={[currentBackup]}
            onToggleFavorite={toggleFavorite}
            onDelete={() => {}} // Disable delete for current backup
            onViewDetails={setSelectedBackup}
            openDeleteModal={() => {}} // Disable delete modal for current backup
            pageSize={1}
          />
        )}
      </div>

      {/* Favorite Backups Table */}
      {favoriteBackups && (
        <>
          <h2 className="text-xl font-semibold mb-3">
            Favorite Backups ({favoriteBackups.length}/5)
          </h2>
          <div className="mb-5">
            <Select
              onValueChange={(value) => setFavoritePageSize(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 per page</SelectItem>
                <SelectItem value="5">5 per page</SelectItem>
              </SelectContent>
            </Select>
            <DataTable
              columns={columns}
              data={favoriteBackups}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteBackup}
              onViewDetails={setSelectedBackup}
              openDeleteModal={openDeleteModal}
              pageSize={favoritePageSize}
            />
          </div>
        </>
      )}

      {/* Daily Backups Table */}
      <h2 className="text-xl font-semibold mb-3">Daily Backups</h2>
      <div className="mb-5">
        <p>Next daily backup in: {dailyCountdown}</p>
        <Select onValueChange={(value) => setDailyPageSize(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
          </SelectContent>
        </Select>
        <DataTable
          columns={columns}
          data={dailyBackups}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteBackup}
          onViewDetails={setSelectedBackup}
          openDeleteModal={openDeleteModal}
          pageSize={dailyPageSize}
        />
      </div>

      {selectedBackup && (
        <div className="mt-8 border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">
            Backup Details (ID: {selectedBackup.id})
          </h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(selectedBackup, null, 2)}
          </pre>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBackup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
