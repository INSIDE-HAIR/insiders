"use client";
import CurrentBackupTab from "@/src/app/[lang]/insiders/(dashboard)/admin/holded/Components/HoldedContactBackup/tabs/CurrentBackupTab";
import DailyBackupsTab from "@/src/app/[lang]/insiders/(dashboard)/admin/holded/Components/HoldedContactBackup/tabs/DailyBackupsTab";
import FavoriteBackupsTab from "@/src/app/[lang]/insiders/(dashboard)/admin/holded/Components/HoldedContactBackup/tabs/FavoriteBackupsTab";
import MonthlyBackupsTab from "@/src/app/[lang]/insiders/(dashboard)/admin/holded/Components/HoldedContactBackup/tabs/MonthlyBackupsTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs/tabs";

function HoldedContactBackup() {
  return (
    <div className="px-20">
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
}

export default HoldedContactBackup;
