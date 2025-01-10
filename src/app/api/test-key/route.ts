// src/app/api/test-key/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RIOT_API_KEY;

  // Test endpoint using champion rotation (simplest Riot API endpoint)
  const testUrl = 'https://na1.api.riotgames.com/lol/platform/v3/champion-rotations';
  
  try {
    // Log the key details (safely)
    console.log('API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length,
      startsWithRGAPI: apiKey?.startsWith('RGAPI-'),
      firstEightChars: apiKey?.substring(0, 8)
    });

    const response = await fetch(testUrl, {
      headers: {
        'X-Riot-Token': apiKey || ''
      }
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      keyDetails: {
        exists: !!apiKey,
        length: apiKey?.length,
        startsWithRGAPI: apiKey?.startsWith('RGAPI-'),
        firstEightChars: apiKey?.substring(0, 8)
      },
      testResponse: {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      keyDetails: {
        exists: !!apiKey,
        length: apiKey?.length,
        startsWithRGAPI: apiKey?.startsWith('RGAPI-'),
        firstEightChars: apiKey?.substring(0, 8)
      }
    }, { status: 500 });
  }
}