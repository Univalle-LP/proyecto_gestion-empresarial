import * as ofertasRepo from '../repositories/ofertas';

export const fetchOfertas = async (ofertaId?: number) => {
  try {
    return await ofertasRepo.getAllOfertas(ofertaId);
  } catch (error) {
    console.error("Error fetching ofertas:", error);
    throw error;
  }
};

export const modifyOfertas = async (oferta: any) => {
  try {
    return await ofertasRepo.updateOferta(oferta);
  } catch (error) {
    console.error("Error updating ofertas:", error);
    throw error;
  }
};

export const createOfertas = async (oferta: any) => {
  try {
    return await ofertasRepo.insertOferta(oferta);
  } catch (error) {
    console.error("Error inserting ofertas:", error);
    throw error;
  }
};

export const deleteOfertas = async (oferta: any) => {
  try {
    return await ofertasRepo.deleteLogicOferta(oferta);
  } catch (error) {
    console.error("Error updating ofertas:", error);
    throw error;
  }
};
