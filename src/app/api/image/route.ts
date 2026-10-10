import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  
  const basePath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\72307bfb-3bc3-44c1-b6ca-ee9a17df9f29';
  const filePath = name === 'hero' ? 'hero_baby_apparel_1784177515557.png' : 'category_baby_accessories_1784177525643.png';
  
  try {
    const fileBuffer = fs.readFileSync(path.join(basePath, filePath));
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return new NextResponse('Image Not found', { status: 404 });
  }
}
