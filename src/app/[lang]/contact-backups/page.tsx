"use client";
import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/src/components/ui/tabs/tabs";
import CurrentBackupTab from "./components/tabs/CurrentBackupTab";
import DailyBackupsTab from "./components/tabs/DailyBackupsTab";
import MonthlyBackupsTab from "./components/tabs/MonthlyBackupsTab";
import FavoriteBackupsTab from "./components/tabs/FavoriteBackupsTab";

const ContactBackupsPage = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Contact Backups</h1>
      <Tabs defaultValue="current">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Backup</TabsTrigger>
          <TabsTrigger value="daily">Daily Backups</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Backups</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Backups</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <CurrentBackupTab />
        </TabsContent>
        <TabsContent value="daily">
          <DailyBackupsTab />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyBackupsTab />
        </TabsContent>
        <TabsContent value="favorites">
          <FavoriteBackupsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactBackupsPage;
