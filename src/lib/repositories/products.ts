import { usePostgres } from '../db';

// ================= CATEGORIAS =================
export const getAllCategorias = async (categoriaId?: number) => {
  const id = categoriaId || 0;
  const sql = usePostgres();
  if (id > 0) {
    return await sql`SELECT * FROM "Categoria" WHERE id_categoria = ${id}`;
  } else {
    return await sql`SELECT * FROM "Categoria" WHERE activo = 1`;
  }
};

export const insertCategorias = async (categoria: { nombre: string; precio_extra: number }) => {
  const { nombre, precio_extra } = categoria;
  const sql = usePostgres();
  return await sql`INSERT INTO "Categoria" (nombre, precio_extra, activo) VALUES (${nombre}, ${precio_extra}, 1)`;
};

export const updateCategorias = async (categoria: [{ id_categoria: number; nombre: string; precio_extra: number }]) => {
  const { id_categoria, nombre, precio_extra } = categoria[0];
  const sql = usePostgres();
  return await sql`
    UPDATE "Categoria" 
    SET nombre = ${nombre}, precio_extra = ${precio_extra} 
    WHERE id_categoria = ${id_categoria}
  `;
};

export const deleteLogicCategorias = async (categoria: { activo: number; id_categoria: number }) => {
  const { activo, id_categoria } = categoria;
  const sql = usePostgres();
  return await sql`
    UPDATE "Categoria" 
    SET activo = ${activo}
    WHERE id_categoria = ${id_categoria}
  `;
};
