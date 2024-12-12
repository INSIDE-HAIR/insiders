import TailwindGrid from "@/src/components/grid/TailwindGrid";
import HoldedContactBackup from "@/src/app/[lang]/admin/holded/Components/HoldedContactBackup/HoldedContactBackup";
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs/tabs";
import HoldedContactTable from "./Components/HoldedContactTable/HoldedContactTable";

function page() {
  return (
    <>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full">
          <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Holded Sync</h1>
            <Tabs defaultValue="tableOfContacts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tableOfContacts">
                  Table of Contacts
                </TabsTrigger>
                <TabsTrigger value="contactBackup">Contact Backups</TabsTrigger>
              </TabsList>
              <TabsContent value="tableOfContacts">
                <HoldedContactTable />
              </TabsContent>
              <TabsContent value="contactBackup">
                <HoldedContactBackup />
              </TabsContent>
              <TabsContent value="monthly"></TabsContent>
              <TabsContent value="favorites"></TabsContent>
            </Tabs>
          </div>
        </main>
      </TailwindGrid>
    </>
  );
}

export default page;
