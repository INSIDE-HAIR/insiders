"use client";
import React, { useState, useEffect, useCallback, useTransition } from "react";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

const ContactBackupsPage: React.FC = () => {
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
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loadingBackupId, setLoadingBackupId] = useState<string | null>(null);
  const [isCreatingManualBackup, setIsCreatingManualBackup] = useState(false);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 100;

  const dataArray = Array.isArray(selectedBackup?.data)
    ? selectedBackup.data
    : [];

  const paginatedData = dataArray.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const totalPages = dataArray.length
    ? Math.ceil(dataArray.length / itemsPerPage)
    : 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const createManualBackup = async () => {
    setIsCreatingManualBackup(true);
    try {
      const response = await fetch("/api/contact-backups", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create manual backup");
      await fetchBackups(); // Refetch all backups to get the updated list
      toast({
        title: "Success",
        description: "Manual backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create manual backup",
        variant: "destructive",
      });
    } finally {
      setIsCreatingManualBackup(false);
    }
  };

  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contact-backups");
      if (!response.ok) throw new Error("Failed to fetch backups");
      const data = await response.json();
      setFavoriteBackups(data.favoriteBackups);
      setDailyBackups(data.dailyBackups);
      setCurrentBackup(data.currentBackup);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch backups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

  const toggleFavorite = useCallback(
    async (backup: ContactBackup) => {
      if (!backup.isFavorite && favoriteBackups.length >= 5) {
        toast({
          title: "Error",
          description: "Maximum number of favorites reached (5)",
          variant: "destructive",
        });
        return;
      }

      setLoadingBackupId(backup.id);

      try {
        const response = await fetch(`/api/contact-backups/${backup.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: !backup.isFavorite }),
        });

        if (!response.ok) throw new Error("Failed to update backup");

        const updatedBackup = await response.json();
        if (updatedBackup.isFavorite) {
          setFavoriteBackups((prev) => [...prev, updatedBackup]);
          setDailyBackups((prev) =>
            prev.filter((b) => b.id !== updatedBackup.id)
          );
        } else {
          setFavoriteBackups((prev) =>
            prev.filter((b) => b.id !== updatedBackup.id)
          );
          setDailyBackups((prev) => [...prev, updatedBackup]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update backup",
          variant: "destructive",
        });
      } finally {
        setLoadingBackupId(null);
      }
    },
    [favoriteBackups, toast]
  );

  const deleteBackup = async (backup: ContactBackup) => {
    if (!backup) return;

    try {
      const response = await fetch(`/api/contact-backups/${backup.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete backup");

      if (backup.isFavorite) {
        setFavoriteBackups((prev) => prev.filter((b) => b.id !== backup.id));
      } else {
        setDailyBackups((prev) => prev.filter((b) => b.id !== backup.id));
      }

      toast({
        title: "Success",
        description: "Backup deleted successfully",
      });
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
      if (!response.ok) throw new Error("Failed to update current backup");

      const updatedBackup = await response.json();
      setCurrentBackup(updatedBackup);
      toast({
        title: "Success",
        description: "Current backup updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update current backup",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (backup: ContactBackup) => {
    setBackupToDelete(backup);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Contact Backups</h1>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Backup</TabsTrigger>
          <TabsTrigger value="daily">Daily Backups</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Backup</CardTitle>
              <CardDescription>
                The most up-to-date backup of your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Next automatic update in: {currentCountdown}</p>
              <Button onClick={updateCurrentBackup} className="mt-2">
                Update Now
              </Button>
              {currentBackup && (
                <DataTable
                  columns={columns}
                  data={[currentBackup]}
                  onToggleFavorite={toggleFavorite}
                  loadingBackupId={loadingBackupId}
                  onDelete={() => {}} // Disable delete for current backup
                  onViewDetails={setSelectedBackup}
                  openDeleteModal={() => {}} // Disable delete modal for current backup
                  pageSize={1}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center ">
                <div>
                  <CardTitle>Daily Backups</CardTitle>
                  <CardDescription>
                    Automatic daily backups of your contacts
                  </CardDescription>
                </div>
                <Button
                  onClick={createManualBackup}
                  disabled={isCreatingManualBackup}
                >
                  {isCreatingManualBackup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Manual Backup...
                    </>
                  ) : (
                    "Create Manual Backup"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={dailyBackups}
                onToggleFavorite={toggleFavorite}
                loadingBackupId={loadingBackupId}
                onDelete={deleteBackup}
                onViewDetails={setSelectedBackup}
                openDeleteModal={openDeleteModal}
                pageSize={dailyPageSize}
              />
              <Select
                onValueChange={(value) => setDailyPageSize(Number(value))}
              >
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-5 flex justify-between items-center">
                <p>Next daily backup in about one hour : {dailyCountdown}</p>
                <p className="text-sm text-gray-500">
                  Total backups: {dailyBackups.length + favoriteBackups.length}
                  /40
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Backups</CardTitle>
              <CardDescription>Your most important backups</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Favorite Backups ({favoriteBackups.length}/5)</p>
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
                loadingBackupId={loadingBackupId}
                onDelete={deleteBackup}
                onViewDetails={setSelectedBackup}
                openDeleteModal={openDeleteModal}
                pageSize={favoritePageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedBackup && (
        <div
          className="mt-8 border rounded-md p-4 bg-gray-200"
          id="selectBackup"
        >
          <h3 className="text-lg font-semibold mb-2">
            Backup Details (ID: {selectedBackup.id})
          </h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(paginatedData, null, 2)}
          </pre>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#selectBackup"
                  className={page === 0 ? "cursor-not-allowed opacity-50" : ""}
                  onClick={() => handlePageChange(Math.max(0, page - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#selectBackup"
                    isActive={index === page}
                    className={
                      index === page ? "cursor-not-allowed opacity-50" : ""
                    }
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#selectBackup"
                  className={
                    page >= totalPages - 1
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }
                  onClick={() =>
                    handlePageChange(Math.min(totalPages - 1, page + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
            <AlertDialogAction
              onClick={() => backupToDelete && deleteBackup(backupToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactBackupsPage;
