import * as adminRepo from '../repositories/admin';

export const actualizarEstadoPedidoAdmin = async (id_pedido: number, nuevo_estado: string) => {
  if (!id_pedido || !nuevo_estado) {
    throw new Error('Faltan parámetros obligatorios para actualizar el estado del pedido');
  }
  return await adminRepo.actualizarEstado(id_pedido, nuevo_estado);
};

export const crearAdminRolService = async (uuid: string) => {
  if (!uuid) {
    throw new Error('UUID obligatorio para crear rol de administrador');
  }
  return await adminRepo.crearAdminRol(uuid);
};

export const fetchDashboardData = async () => {
  return await adminRepo.obtenerDatosDashboard();
};

export const fetchPedidosAdmin = async () => {
  return await adminRepo.obtenerPedidos();
};

export const fetchPedidoPorIdAdmin = async (idPedido: number) => {
  if (!idPedido) {
    throw new Error('ID de pedido obligatorio');
  }
  return await adminRepo.obtenerPedidoPorId(idPedido);
};
