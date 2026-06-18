import { NextRequest, NextResponse } from 'next/server';
import { fetchPizzaIngredientes, addIngredienteToPizza, removeIngredienteFromPizza } from '@/lib/services/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idPizzaStr = searchParams.get('id_pizza');
  const idPizza = idPizzaStr ? Number(idPizzaStr) : 0;

  if (idPizza <= 0) {
    return NextResponse.json({ error: 'ID de pizza no proporcionado' }, { status: 400 });
  }

  try {
    const result = await fetchPizzaIngredientes(idPizza);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching pizza ingredients:', error);
    return NextResponse.json({ error: 'Error al obtener los ingredientes de la pizza', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id_pizza, id_ingrediente, cantidad } = await request.json();
    if (!id_pizza || !id_ingrediente || cantidad === undefined) {
      return NextResponse.json({ error: 'Faltan datos necesarios para agregar ingrediente' }, { status: 400 });
    }
    const result = await addIngredienteToPizza(Number(id_pizza), Number(id_ingrediente), Number(cantidad));
    return NextResponse.json({ success: true, message: 'Ingrediente agregado correctamente', result });
  } catch (error: any) {
    console.error('Error adding pizza ingredient:', error);
    return NextResponse.json({ error: 'Error al agregar ingrediente a la pizza', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id_pizza, id_ingrediente } = await request.json();
    if (!id_pizza || !id_ingrediente) {
      return NextResponse.json({ error: 'Faltan datos necesarios para eliminar ingrediente' }, { status: 400 });
    }
    const result = await removeIngredienteFromPizza(Number(id_pizza), Number(id_ingrediente));
    return NextResponse.json({ success: true, message: 'Ingrediente eliminado correctamente', result });
  } catch (error: any) {
    console.error('Error removing pizza ingredient:', error);
    return NextResponse.json({ error: 'Error al eliminar ingrediente de la pizza', details: error.message }, { status: 500 });
  }
}
