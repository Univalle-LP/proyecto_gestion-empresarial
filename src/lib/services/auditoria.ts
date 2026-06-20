import * as auditoriaRepo from '../repositories/auditoria';

export const registrarAccion = async (data: {
  id_usuario?: string | null;
  accion: string;
  entidad?: string | null;
  entidad_id?: string | null;
  detalles?: any;
}) => {
  return await auditoriaRepo.registrarAuditoria(data);
};

export const obtenerLogs = async (limit = 100) => {
  return await auditoriaRepo.obtenerLogsAuditoria(limit);
};
