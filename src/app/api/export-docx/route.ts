import { NextRequest, NextResponse } from 'next/server';
import htmlToDocx from 'html-to-docx';

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();

    if (!html) {
      return new NextResponse('HTML content is required', { status: 400 });
    }

    const docxBuffer = await htmlToDocx(html);

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error converting to .docx file.', { status: 500 });
  }
}
