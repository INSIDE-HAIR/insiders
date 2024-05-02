"use server";
import { getUsers } from "@/data/user";

// const options = {
//   method: "GET",
//   headers: { accept: "application/json", key: `${process.env.HOLDED_API_KEY}` },
// };

// export const getListContacts = async () => {
//   return fetch("https://api.holded.com/api/invoicing/v1/contacts", options)
//     .then((response) => response.json())
//     .then((response) => console.log(response))
//     .catch((err) => console.error(err));
// };

export const getListUsers = async () => {
  const users = await getUsers();
  return users;
};
