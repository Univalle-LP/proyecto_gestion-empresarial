import { usePostgres } from '../db';

export const getUser = async (data: { uuid: string; name: string }) => {
  const sql = usePostgres();
  const { uuid, name } = data;
  console.log("Usuario ", uuid);
  console.log("Nombre ", name);

  const client = await sql`SELECT id_rol from "UsuarioRol" Where id_usuario = ${uuid};`;
  if (client.length > 0) {
    return "OK";
  } else {
    console.log("El usuario no tiene rol asignado creando cliente y rol");
    const exists = await verifyUserSupabase(uuid);
    if (exists) {
      await sql`SELECT * from crear_cliente_rol(${name}, ${uuid});`;
      return "OK";
    }
    return "USER_NOT_FOUND_IN_SUPABASE";
  }
};

async function verifyUserSupabase(uuid: string) {
  const sql = usePostgres();
  const id = await sql`SELECT * FROM get_user(${uuid});`;
  return id.length > 0;
}

export const getRole = async (data: { id: string }) => {
  const sql = usePostgres();
  const { id } = data;
  const rol = await sql`SELECT * FROM obtener_rol_usuario(${id});`;
  return rol[0]?.obtener_rol_usuario || 'comun';
};
