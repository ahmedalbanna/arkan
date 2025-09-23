
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, action } = await request.json();

    if (!text || !action) {
      return NextResponse.json({ error: 'Text and action are required' }, { status: 400 });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let responseText = '';

    switch (action) {
      case 'summarize':
        responseText = `[ملخص تجريبي]: ${text.substring(0, 100)}...`;
        break;
      case 'rewrite':
        responseText = `[إعادة صياغة تجريبية]: تمت إعادة صياغة النص: ${text.substring(0, 100)}...`;
        break;
      case 'humanize':
        responseText = `[أنسنة تجريبية]: تمت أنسنة النص: ${text.substring(0, 100)}...`;
        break;
      case 'grammar':
        responseText = `[تدقيق إملائي تجريبي]: لا توجد أخطاء إملائية في النص: ${text.substring(0, 100)}...`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ result: responseText });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
