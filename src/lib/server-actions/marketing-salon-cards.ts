"use server"
import { z } from "zod";
import { RequestMarketingSalonSchema } from "../types/inside-schemas";

export const MarketingSalonCards = async (values:z.infer<typeof RequestMarketingSalonSchema>)=>{
    const validatedFields = RequestMarketingSalonSchema.safeParse(values)

  if(!validatedFields.success){
    return {error: "Petición Incorrecta :("}
  }

  try {
    const {campaign, year, month, client} = validatedFields.data;
    console.log("Valid data:", validatedFields.data);

  } catch (error) {
    console.error("Validation errors:", error);
  }

}