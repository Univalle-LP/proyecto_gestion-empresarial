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
