import { getConfiguracion, updateConfiguracion } from '../repositories/configuracion';

export const fetchConfiguracion = async () => {
  return await getConfiguracion();
};

export const modifyConfiguracion = async (config: {
  nombre_pizzeria: string;
  logo_url: string;
  theme_flavor: string;
  custom_colors: any;
}) => {
  return await updateConfiguracion(config);
};
