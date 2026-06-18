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

// ================= INGREDIENTES =================
export const fetchIngrediente = async (ingredienteId?: number) => {
  const id = ingredienteId || 0;
  const sql = usePostgres();
  if (id > 0) {
    return await sql`SELECT * FROM "Ingrediente" WHERE id_ingrediente = ${id}`;
  } else {
    return await sql`SELECT * FROM "Ingrediente" WHERE activo = 1`;
  }
};

export const createIngrediente = async (ingrediente: { nombre: string; costo_unitario: number; tipo: string }) => {
  const { nombre, costo_unitario, tipo } = ingrediente;
  const sql = usePostgres();
  return await sql`
    INSERT INTO "Ingrediente" (nombre, costo_unitario, tipo, activo)
    VALUES (${nombre}, ${costo_unitario}, ${tipo}, 1)
  `;
};

export const modifyIngrediente = async (ingrediente: [{ id_ingrediente: number; nombre: string; costo_unitario: number; tipo: string }]) => {
  const { id_ingrediente, nombre, costo_unitario, tipo } = ingrediente[0];
  const sql = usePostgres();
  return await sql`
    UPDATE "Ingrediente"
    SET nombre = ${nombre}, costo_unitario = ${costo_unitario}, tipo = ${tipo}
    WHERE id_ingrediente = ${id_ingrediente}
  `;
};

export const deleteIngrediente = async (ingrediente: { activo: number; id_ingrediente: number }) => {
  const { activo, id_ingrediente } = ingrediente;
  const sql = usePostgres();
  return await sql`
    UPDATE "Ingrediente"
    SET activo = ${activo}
    WHERE id_ingrediente = ${id_ingrediente}
  `;
};
