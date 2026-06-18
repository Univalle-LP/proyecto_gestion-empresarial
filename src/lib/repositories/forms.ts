import { usePostgres } from '../db';

export const getGeneralTime = async (data: { id_cliente: string; titulo_encuesta: string }) => {
  const { id_cliente, titulo_encuesta } = data;
  const sql = usePostgres();
  const response = await sql`SELECT * FROM get_time_since_answer(${id_cliente}, ${titulo_encuesta})`;
  const meses = response[0]?.get_time_since_answer;
  return meses;
};

export const insertSurveyAnswer = async (data: {
  id_cliente: string;
  id_encuesta: number;
  respuestas: any;
}) => {
  try {
    const { id_cliente, id_encuesta, respuestas } = data;
    const sql = usePostgres();
    console.log('Insertando encuesta:', { id_cliente, id_encuesta, respuestas });

    const result = await sql`
      SELECT public.insert_full_survey_answer(
        ${id_cliente}, 
        ${id_encuesta}, 
        ${respuestas}
      )
    `;
    const id_respuesta = result[0]?.insert_full_survey_answer;
    if (!id_respuesta) {
      throw new Error("No se generó una respuesta válida");
    }
    return {
      ok: true,
      id_respuesta
    };
  } catch (err: any) {
    console.error("Error al guardar la encuesta:", err);
    return {
      ok: false,
      error: err.message || 'Error desconocido'
    };
  }
};
