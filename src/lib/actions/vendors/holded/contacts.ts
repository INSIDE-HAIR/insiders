// src/lib/actions/vendors/holded/contacts.ts
"use server";
const HOLDED_API_KEY = process.env.HOLDED_API_KEY;
const HOLDED_API_URL = "https://api.holded.com/api/invoicing/v1/contacts";

export const getListHoldedContacts = async () => {
  try {
    console.log(`Fetching contacts from: ${HOLDED_API_URL}`);

    const response = await fetch(HOLDED_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        key: HOLDED_API_KEY as string,
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
    const url = `${HOLDED_API_URL}/${contactId}`;
    console.log(`Fetching contact with ID ${contactId} from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        key: HOLDED_API_KEY as string,
      },
    });

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
