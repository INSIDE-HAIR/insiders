import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";
import HoldedContactBackup from "@/src/app/[lang]/(private)/admin/holded/Components/HoldedContactBackup/HoldedContactBackup";
import React from "react";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import HoldedContactTable from "./Components/HoldedContactTable/HoldedContactTable";
import { Building2 } from "lucide-react";

function page() {
  return (
    <div>
      <DocHeader
        title='Holded Sync'
        description='Gestiona contactos y sincronización con Holded CRM'
        icon={Building2}
      />

      <DocContent>
        <TailwindGrid fullSize>
          <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
            <div className='container mx-auto py-10'>
              <Tabs defaultValue='tableOfContacts'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='tableOfContacts'>
                  Table of Contacts
                </TabsTrigger>
                <TabsTrigger value='contactBackup'>Contact Backups</TabsTrigger>
              </TabsList>
              <TabsContent value='tableOfContacts'>
                <HoldedContactTable />
              </TabsContent>
              <TabsContent value='contactBackup'>
                <HoldedContactBackup />
              </TabsContent>
              <TabsContent value='monthly'></TabsContent>
              <TabsContent value='favorites'></TabsContent>
            </Tabs>
            </div>
          </main>
        </TailwindGrid>
      </DocContent>
    </div>
  );
}

export default page;
