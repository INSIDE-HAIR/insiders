// src/lib/actions/vendors/holded/contacts.ts
"use server";

import { headers } from "next/headers";

const getBaseUrl = () => {
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
};

export const getListHoldedContacts = async () => {
  try {
    const baseUrl = getBaseUrl();
    console.log(
      `Fetching contacts from: ${baseUrl}/api/vendor/holded/contacts`
    );

    const response = await fetch(`${baseUrl}/api/vendor/holded/contacts`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length || 0} contacts`);
    return data;
  } catch (error) {
    console.error("Error fetching Holded contacts:", error);
    throw new Error("Failed to fetch Holded contacts");
  }
};

export const getHoldedContactById = async (contactId: string) => {
  try {
    const baseUrl = getBaseUrl();
    console.log(
      `Fetching contact with ID ${contactId} from: ${baseUrl}/api/vendor/holded/contacts/${contactId}`
    );

    const response = await fetch(
      `${baseUrl}/api/vendor/holded/contacts/${contactId}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched contact data:", data);
    return data;
  } catch (error) {
    console.error(`Error fetching Holded contact with ID ${contactId}:`, error);
    throw new Error(`Failed to fetch Holded contact with ID ${contactId}`);
  }
};
