import { usePostgres } from '../db';

export const registrarAuditoria = async (data: {
  id_usuario?: string | null;
  accion: string;
  entidad?: string | null;
  entidad_id?: string | null;
  detalles?: any;
}) => {
  try {
    const sql = usePostgres();
    const { id_usuario, accion, entidad, entidad_id, detalles } = data;

    const detallesStr = detalles ? JSON.stringify(detalles) : null;

    if (detallesStr) {
      await sql`
        INSERT INTO "Auditoria" (id_usuario, accion, entidad, entidad_id, detalles)
        VALUES (
          ${id_usuario || null}, 
          ${accion}, 
          ${entidad || null}, 
          ${entidad_id || null}, 
          ${detallesStr}::jsonb
        )
      `;
    } else {
      await sql`
        INSERT INTO "Auditoria" (id_usuario, accion, entidad, entidad_id, detalles)
        VALUES (
          ${id_usuario || null}, 
          ${accion}, 
          ${entidad || null}, 
          ${entidad_id || null}, 
          NULL
        )
      `;
    }

    return { success: true };
  } catch (error) {
    console.error("Error al registrar auditoria:", error);
    return { success: false, error };
  }
};

export const obtenerLogsAuditoria = async (limit = 100) => {
  try {
    const sql = usePostgres();
    return await sql`
      SELECT 
        a.id,
        a.id_usuario,
        a.accion,
        a.entidad,
        a.entidad_id,
        a.detalles,
        a.fecha,
        u.email AS usuario_email,
        u.raw_user_meta_data ->> 'full_name' AS usuario_nombre
      FROM "Auditoria" a
      LEFT JOIN auth.users u ON a.id_usuario = u.id
      ORDER BY a.fecha DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    console.error("Error al obtener logs de auditoria:", error);
    throw error;
  }
};
