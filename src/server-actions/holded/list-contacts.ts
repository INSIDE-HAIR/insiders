"use server";
export const getListHoldedContacts = async () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // Define la base URL, ajusta según sea necesario
  const response = await fetch(`${baseUrl}/api/vendor/holded/contacts`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      key: process.env.HOLDED_API_KEY as string, // Asegúrate de configurar esta variable en tu entorno
    },
  });
  const data = await response.json();

  return data;
};
