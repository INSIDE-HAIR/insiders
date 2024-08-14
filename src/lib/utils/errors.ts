// utils/errorHandler.ts

import { NextResponse } from "next/server";

export function handleError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (typeof error === "string") {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ error: defaultMessage }, { status: 500 });
}
