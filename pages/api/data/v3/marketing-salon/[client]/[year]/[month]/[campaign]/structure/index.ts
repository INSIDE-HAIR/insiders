import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaign, year, month, client } = req.query;

  try {
    const filePath = path.resolve(
      `./db/v3/services-structures/marketing-salon/${campaign}/${client}/`,
      `${year}.json`
    );
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    const monthData = jsonData[month as string] || {}; // Provide a default value if jsonData[month] is undefined

    return res.status(200).json(monthData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      res.status(404).json({ message: "Year or month data not found." });
    } else {
      res.status(500).json({ message: "Error reading file." });
    }
  }
}
