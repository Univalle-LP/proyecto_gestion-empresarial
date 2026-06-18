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

// ================= TAMAÑOS =================
export const getAllTamanos = async (tamanoId?: number) => {
  const id = tamanoId || 0;
  const sql = usePostgres();
  if (id > 0) {
    return await sql`SELECT * FROM "Tamano" WHERE id_tamano = ${id}`;
  } else {
    return await sql`SELECT * FROM "Tamano" WHERE activo = 1`;
  }
};

export const insertTamanos = async (tamano: { nombre: string; descripcion: string; precio_base: number }) => {
  const { nombre, descripcion, precio_base } = tamano;
  const sql = usePostgres();
  return await sql`INSERT INTO "Tamano" (nombre, descripcion, precio_base) VALUES (${nombre}, ${descripcion}, ${precio_base})`;
};

export const updateTamanos = async (tamano: [{ id_tamano: number; nombre: string; descripcion: string; precio_base: number }]) => {
  const { id_tamano, nombre, descripcion, precio_base } = tamano[0];
  const sql = usePostgres();
  return await sql`
    UPDATE "Tamano" 
    SET nombre = ${nombre}, descripcion = ${descripcion}, precio_base = ${precio_base} 
    WHERE id_tamano = ${id_tamano}
  `;
};

export const deleteLogicTamano = async (tamano: { id_tamano: number; activo: number }) => {
  const { id_tamano, activo } = tamano;
  const sql = usePostgres();
  return await sql`
    UPDATE "Tamano" 
    SET activo = ${activo} 
    WHERE id_tamano = ${id_tamano}
  `;
};

// ================= PRODUCTOS =================
export const fetchProducto = async (productoId?: number) => {
  const id = productoId || 0;
  const sql = usePostgres();
  if (id > 0) {
    return await sql`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM "Producto" p
      LEFT JOIN "Categoria" c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ${id}
    `;
  } else {
    return await sql`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM "Producto" p
      LEFT JOIN "Categoria" c ON p.id_categoria = c.id_categoria
      WHERE p.activo = 1
    `;
  }
};

export const createProducto = async (producto: { nombre: string; descripcion: string; precio: number; id_categoria: number }) => {
  const { nombre, descripcion, precio, id_categoria } = producto;
  const sql = usePostgres();
  return await sql`
    INSERT INTO "Producto" (nombre, descripcion, precio, id_categoria, activo)
    VALUES (${nombre}, ${descripcion}, ${precio}, ${id_categoria}, 1)
  `;
};

export const modifyProducto = async (producto: { id_producto: number; nombre: string; descripcion: string; precio: number; id_categoria: number }) => {
  const { id_producto, nombre, descripcion, precio, id_categoria } = producto;
  const sql = usePostgres();
  return await sql`
    UPDATE "Producto"
    SET nombre = ${nombre}, descripcion = ${descripcion}, precio = ${precio}, id_categoria = ${id_categoria}
    WHERE id_producto = ${id_producto}
  `;
};

export const deleteProducto = async (producto: { activo: number; id_producto: number }) => {
  const { activo, id_producto } = producto;
  const sql = usePostgres();
  return await sql`
    UPDATE "Producto"
    SET activo = ${activo}
    WHERE id_producto = ${id_producto}
  `;
};

// ================= PIZZAS =================
export const fetchPizza = async (pizzaId?: number) => {
  const id = pizzaId || 0;
  const sql = usePostgres();
  if (id > 0) {
    return await sql`SELECT * FROM "Pizza" WHERE id_pizza = ${id}`;
  } else {
    return await sql`SELECT * FROM "Pizza" WHERE activo = 1`;
  }
};

export const createPizza = async (pizza: { nombre: string; descripcion: string }) => {
  const { nombre, descripcion } = pizza;
  const sql = usePostgres();
  return await sql`
    INSERT INTO "Pizza" (nombre, descripcion, activo)
    VALUES (${nombre}, ${descripcion}, 1)
  `;
};

export const modifyPizza = async (pizza: [{ id_pizza: number; nombre: string; descripcion: string }]) => {
  const { id_pizza, nombre, descripcion } = pizza[0];
  const sql = usePostgres();
  return await sql`
    UPDATE "Pizza"
    SET nombre = ${nombre}, descripcion = ${descripcion}
    WHERE id_pizza = ${id_pizza}
  `;
};

export const deletePizza = async ({ id_pizza }: { id_pizza: number }) => {
  const sql = usePostgres();
  return await sql`
    UPDATE "Pizza"
    SET activo = 0
    WHERE id_pizza = ${id_pizza}
  `;
};
