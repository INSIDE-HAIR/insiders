import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { campaign: string };
  }
) {
  const { campaign } = params;

  if (!campaign) {
    return NextResponse.json(
      { message: "Missing query parameters" },
      { status: 400 }
    );
  }

  try {
    const filePath = path.resolve(
      process.cwd(),
      `./db/insiders/services-structures/training/start-marketing/${campaign}.json`
    );

    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    const campaignData = jsonData || {}; // Provide a default value if jsonData is undefined

    return NextResponse.json(campaignData, { status: 200 });
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
