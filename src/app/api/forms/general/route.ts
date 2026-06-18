import { NextRequest, NextResponse } from 'next/server';
import { fetchGeneralTime, createSurveyAnswer } from '@/lib/services/forms';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id_cliente = searchParams.get('id_cliente');
  const titulo_encuesta = searchParams.get('titulo_encuesta');

  if (!id_cliente || !titulo_encuesta) {
    return NextResponse.json({ error: 'Faltan parámetros: id_cliente o titulo_encuesta' }, { status: 400 });
  }

  try {
    const result = await fetchGeneralTime({ id_cliente, titulo_encuesta });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching survey time:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await createSurveyAnswer(body);
    // Original returns 1
    return NextResponse.json(1);
  } catch (error: any) {
    console.error('Error saving survey answer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
