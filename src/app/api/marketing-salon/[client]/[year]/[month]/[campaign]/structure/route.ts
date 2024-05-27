import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { campaign: string; year: string; month: string; client: string };
  }
) {
  const { campaign, client, month, year } = params;

  console.log("campaign", campaign);
  console.log("year", year);
  console.log("month", month);
  console.log("client", client);

  if (!campaign || !year || !month || !client) {
    return NextResponse.json(
      { message: "Missing query parameters" },
      { status: 400 }
    );
  }

  try {
    const filePath = path.resolve(
      process.cwd(),
      `./db/insiders/services-structures/marketing-salon/${campaign}/${client}/${year}.json`
    );

    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    const monthData = jsonData[month] || {}; // Provide a default value if jsonData[month] is undefined

    return NextResponse.json(monthData, { status: 200 });
  } catch (error) {
    console.error(error);
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ message: "Data not found." }, { status: 404 });
    } else {
      return NextResponse.json(
        { message: "Error reading file." },
        { status: 500 }
      );
    }
  }
}
