'use client'
import React, { useState, useEffect } from "react";
import { ContactBackup, BackupType } from "@prisma/client";
import { DataTable } from "./components/DataTable";
import { columns } from "./components/columns";
import { useToast } from "@/src/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

type BackupWithFavorite = ContactBackup & { isFavorite: boolean };

const ContactBackupsPage: React.FC = () => {
  const [backups, setBackups] = useState<BackupWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/backups");
      if (!response.ok) throw new Error("Failed to fetch backups");
      const data = await response.json();
      setBackups(data.backups);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch backups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (backup: BackupWithFavorite) => {
    try {
      const response = await fetch(`/api/backups/${backup.id}/favorite`, {
        method: backup.isFavorite ? "DELETE" : "POST",
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      await fetchBackups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const deleteBackup = async (backup: BackupWithFavorite) => {
    try {
      const response = await fetch(`/api/backups/${backup.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete backup");
      await fetchBackups();
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
    }
  };

  const createOrUpdateBackup = async (type: BackupType) => {
    try {
      const response = await fetch(`/api/backups/${type.toLowerCase()}`, {
        method: "POST",
      });
      if (!response.ok)
        throw new Error(`Failed to create/update ${type} backup`);
      await fetchBackups();
      toast({
        title: "Success",
        description: `${type} backup created/updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create/update ${type} backup`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentBackup = backups.find((b) => b.type === BackupType.CURRENT);
  const dailyBackups = backups.filter((b) => b.type === BackupType.DAILY);
  const monthlyBackups = backups.filter((b) => b.type === BackupType.MONTHLY);
  const favoriteBackups = backups.filter((b) => b.isFavorite);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Contact Backups</h1>

      <div className="flex space-x-4 mb-6">
        <Button onClick={() => createOrUpdateBackup(BackupType.CURRENT)}>
          Create/Update Current Backup
        </Button>
        <Button onClick={() => createOrUpdateBackup(BackupType.DAILY)}>
          Create/Update Daily Backup
        </Button>
        <Button onClick={() => createOrUpdateBackup(BackupType.MONTHLY)}>
          Create/Update Monthly Backup
        </Button>
      </div>

      <Tabs defaultValue="current">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Backup</TabsTrigger>
          <TabsTrigger value="daily">Daily Backups</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Backups</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Backup</CardTitle>
              <CardDescription>
                The most recent backup of your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={currentBackup ? [currentBackup] : []}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteBackup}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Backups</CardTitle>
              <CardDescription>
                Backups created on a daily basis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={dailyBackups}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteBackup}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Backups</CardTitle>
              <CardDescription>
                Backups created on a monthly basis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={monthlyBackups}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteBackup}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Backups</CardTitle>
              <CardDescription>Your starred backups</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={favoriteBackups}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteBackup}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactBackupsPage;
