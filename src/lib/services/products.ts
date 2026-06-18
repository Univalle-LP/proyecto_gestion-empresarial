import * as productsRepo from '../repositories/products';

// ================= CATEGORIAS =================
export const fetchCategorias = async (categoriaId?: number) => {
  return await productsRepo.getAllCategorias(categoriaId);
};

export const createCategorias = async (categoria: { nombre: string; precio_extra: number }) => {
  return await productsRepo.insertCategorias(categoria);
};

export const modifyCategorias = async (categoria: [{ id_categoria: number; nombre: string; precio_extra: number }]) => {
  return await productsRepo.updateCategorias(categoria);
};

export const deleteLogicCategorias = async (categoria: { activo: number; id_categoria: number }) => {
  return await productsRepo.deleteLogicCategorias(categoria);
};

// ================= INGREDIENTES =================
export const fetchIngrediente = async (ingredienteId?: number) => {
  return await productsRepo.fetchIngrediente(ingredienteId);
};

export const createIngrediente = async (ingrediente: { nombre: string; costo_unitario: number; tipo: string }) => {
  return await productsRepo.createIngrediente(ingrediente);
};

export const modifyIngrediente = async (ingrediente: [{ id_ingrediente: number; nombre: string; costo_unitario: number; tipo: string }]) => {
  return await productsRepo.modifyIngrediente(ingrediente);
};

export const deleteIngrediente = async (ingrediente: { activo: number; id_ingrediente: number }) => {
  return await productsRepo.deleteIngrediente(ingrediente);
};

// ================= PIZZAS =================
export const fetchPizza = async (pizzaId?: number) => {
  return await productsRepo.fetchPizza(pizzaId);
};

export const createPizza = async (pizza: { nombre: string; descripcion: string }) => {
  return await productsRepo.createPizza(pizza);
};

export const modifyPizza = async (pizza: [{ id_pizza: number; nombre: string; descripcion: string }]) => {
  return await productsRepo.modifyPizza(pizza);
};

export const deletePizza = async ({ id_pizza }: { id_pizza: number }) => {
  return await productsRepo.deletePizza({ id_pizza });
};

// ================= PIZZA INGREDIENTES =================
export const fetchPizzaIngredientes = async (idPizza: number) => {
  return await productsRepo.fetchPizzaIngredientes(idPizza);
};

export const addIngredienteToPizza = async (idPizza: number, idIngrediente: number, cantidad: number) => {
  return await productsRepo.addIngredienteToPizza(idPizza, idIngrediente, cantidad);
};

export const removeIngredienteFromPizza = async (idPizza: number, idIngrediente: number) => {
  return await productsRepo.removeIngredienteFromPizza(idPizza, idIngrediente);
};

// ================= PRODUCTOS =================
export const fetchProducto = async (productoId?: number) => {
  return await productsRepo.fetchProducto(productoId);
};

export const createProducto = async (producto: { nombre: string; descripcion: string; precio: number; id_categoria: number }) => {
  return await productsRepo.createProducto(producto);
};

export const modifyProducto = async (producto: { id_producto: number; nombre: string; descripcion: string; precio: number; id_categoria: number }) => {
  return await productsRepo.modifyProducto(producto);
};

export const deleteProducto = async (producto: { activo: number; id_producto: number }) => {
  return await productsRepo.deleteProducto(producto);
};

// ================= TAMAÑOS =================
export const fetchTamanos = async (tamanoId?: number) => {
  return await productsRepo.getAllTamanos(tamanoId);
};

export const createTamanos = async (tamano: { nombre: string; descripcion: string; precio_base: number }) => {
  return await productsRepo.insertTamanos(tamano);
};

export const modifyTamanos = async (tamano: [{ id_tamano: number; nombre: string; descripcion: string; precio_base: number }]) => {
  return await productsRepo.updateTamanos(tamano);
};

export const deleteLogicTamano = async (tamano: { id_tamano: number; activo: number }) => {
  return await productsRepo.deleteLogicTamano(tamano);
};
