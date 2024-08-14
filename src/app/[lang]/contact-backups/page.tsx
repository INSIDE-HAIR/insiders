'use client'
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

type OptimisticAction =
  | { type: "add"; backup: ContactBackup }
  | { type: "remove"; id: string }
  | { type: "update"; backup: ContactBackup };

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

  const [optimisticFavorites, setOptimisticFavorites] = React.useOptimistic(
    favoriteBackups,
    (state: ContactBackup[], action: OptimisticAction): ContactBackup[] => {
      switch (action.type) {
        case "add":
          return [...state, action.backup];
        case "remove":
          return state.filter((b) => b.id !== action.id);
        case "update":
          return state.map((b) =>
            b.id === action.backup.id ? action.backup : b
          );
        default:
          return state;
      }
    }
  );

  const [optimisticDailyBackups, setOptimisticDailyBackups] =
    React.useOptimistic(
      dailyBackups,
      (state: ContactBackup[], action: OptimisticAction): ContactBackup[] => {
        switch (action.type) {
          case "add":
            return [...state, action.backup];
          case "remove":
            return state.filter((b) => b.id !== action.id);
          case "update":
            return state.map((b) =>
              b.id === action.backup.id ? action.backup : b
            );
          default:
            return state;
        }
      }
    );

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
      if (!backup.isFavorite && optimisticFavorites.length >= 5) {
        toast({
          title: "Error",
          description: "Maximum number of favorites reached (5)",
          variant: "destructive",
        });
        return;
      }

      const optimisticBackup = { ...backup, isFavorite: !backup.isFavorite };

      startTransition(() => {
        if (optimisticBackup.isFavorite) {
          setOptimisticFavorites({ type: "add", backup: optimisticBackup });
          setOptimisticDailyBackups({ type: "remove", id: backup.id });
        } else {
          setOptimisticFavorites({ type: "remove", id: backup.id });
          setOptimisticDailyBackups({ type: "add", backup: optimisticBackup });
        }
      });

      try {
        const response = await fetch(`/api/contact-backups/${backup.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: !backup.isFavorite }),
        });

        if (!response.ok) throw new Error("Failed to update backup");

        const updatedBackup = await response.json();
        // Update the actual state
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
        // Revert optimistic update
        startTransition(() => {
          if (backup.isFavorite) {
            setOptimisticFavorites({ type: "add", backup });
            setOptimisticDailyBackups({ type: "remove", id: backup.id });
          } else {
            setOptimisticFavorites({ type: "remove", id: backup.id });
            setOptimisticDailyBackups({ type: "add", backup });
          }
        });

        toast({
          title: "Error",
          description: "Failed to update backup",
          variant: "destructive",
        });
      }
    },
    [
      optimisticFavorites,
      toast,
      setOptimisticFavorites,
      setOptimisticDailyBackups,
    ]
  );

  const deleteBackup = async (backup: ContactBackup) => {
    if (!backup) return;

    try {
      const response = await fetch(`/api/contact-backups/${backup.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete backup");

      startTransition(() => {
        if (backup.isFavorite) {
          setOptimisticFavorites({ type: "remove", id: backup.id });
        } else {
          setOptimisticDailyBackups({ type: "remove", id: backup.id });
        }
      });

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
              <CardTitle>Daily Backups</CardTitle>
              <CardDescription>
                Automatic daily backups of your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Next daily backup in: {dailyCountdown}</p>
              <Select
                onValueChange={(value) => setDailyPageSize(Number(value))}
              >
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
                data={optimisticDailyBackups}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteBackup}
                onViewDetails={setSelectedBackup}
                openDeleteModal={openDeleteModal}
                pageSize={dailyPageSize}
              />
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
              <p>Favorite Backups ({optimisticFavorites.length}/5)</p>
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
                data={optimisticFavorites}
                onToggleFavorite={toggleFavorite}
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
