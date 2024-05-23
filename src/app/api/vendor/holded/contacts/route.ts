import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      key: process.env.HOLDED_API_KEY as string, // Asegúrate de configurar esta variable en tu entorno
    },
    // No caching headers to prevent the large response caching error
    next: { revalidate: 0 },
  };

  try {
    const response = await fetch('https://api.holded.com/api/invoicing/v1/contacts', options);
    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 });
  }
}