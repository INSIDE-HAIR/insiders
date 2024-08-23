// src/lib/actions/vendors/holded/contacts.ts
"use server";

const getBaseUrl = () => {
  return process.env.BASE_URL || "http://localhost:3000/api"; // Define la base URL, ajusta según sea necesario
};

export const getListHoldedContacts = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/vendor/holded/contacts`);
  const data = await response.json();
  console.log("Fetched contacts data:", data); // Log the data

  return data;
};

export const getHoldedContactById = async (contactId: string) => {
  const baseUrl = getBaseUrl();
  const response = await fetch(
    `${baseUrl}/vendor/holded/contacts/${contactId}`
  );
  const data = await response.json();

  return data;
};
