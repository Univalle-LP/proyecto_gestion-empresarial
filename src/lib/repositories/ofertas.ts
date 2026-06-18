import { usePostgres } from '../db';

export const getAllOfertas = async (ofertaId?: number) => {
  const id = ofertaId || 0;
  const sql = usePostgres();
  let ofertas;
  if (id > 0) {
    ofertas = await sql`
      SELECT o.*, ARRAY_AGG(op.id_pizza) AS pizzas 
      FROM "Oferta" o 
      LEFT JOIN "Pizza_Oferta" op ON op.id_oferta = o.id_oferta 
      WHERE o.id_oferta = ${id} 
      GROUP BY o.id_oferta;
    `;
  } else {
    ofertas = await sql`SELECT * FROM vw_ofertas_con_pizzas`;
  }
  return ofertas;
};

export const insertOferta = async (oferta: any) => {
  const sql = usePostgres();
  const result = await sql`
    SELECT public.insertar_oferta(${oferta})
  `;
  const id_oferta = result[0]?.insertar_oferta;
  if (!id_oferta) {
    throw new Error('No se pudo insertar la oferta');
  }
  return { ok: true, id_oferta };
};

export const updateOferta = async (oferta: {
  id_oferta: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  descuento?: number;
  n_cantidad?: number;
  m_paga?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: number;
  pizzas: number[];
}) => {
  const sql = usePostgres();
  const {
    id_oferta,
    nombre,
    descripcion,
    tipo,
    descuento,
    n_cantidad,
    m_paga,
    fecha_inicio,
    fecha_fin,
    activo,
    pizzas
  } = oferta;

  await sql`
    SELECT actualizar_oferta_con_pizzas(
      ${id_oferta},
      ${nombre},
      ${descripcion},
      ${tipo},
      ${descuento || null}, 
      ${n_cantidad || null},
      ${m_paga || null},
      ${fecha_inicio},
      ${fecha_fin},
      ${activo},
      ${sql.array(pizzas, 'integer' as any).value}
    );
  `;

  return { ok: true };
};

export const deleteLogicOferta = async (oferta: any) => {
  return "ok";
};
