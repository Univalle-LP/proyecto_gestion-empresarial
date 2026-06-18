import { getGeneralTime, insertSurveyAnswer } from '../repositories/forms';

export const fetchGeneralTime = async (data: { id_cliente: string; titulo_encuesta: string }) => {
  try {
    const { id_cliente, titulo_encuesta } = data;
    if (!id_cliente || !titulo_encuesta) {
      return 0;
    }
    const timeInMonths = await getGeneralTime(data);
    return timeInMonths;
  } catch (error) {
    console.error("Error fetching general time:", error);
    return 0;
  }
};

export const createSurveyAnswer = async (surveyData: {
  id_cliente: string;
  id_encuesta: number;
  respuestas: any;
}) => {
  try {
    const { id_cliente, id_encuesta, respuestas } = surveyData;
    if (!id_cliente || !id_encuesta || !respuestas) {
      console.warn("Datos incompletos o inválidos en la encuesta.");
      return false;
    }
    const result = await insertSurveyAnswer(surveyData);
    if (!result || result.error) {
      console.warn("Hubo un problema al guardar la encuesta: " + JSON.stringify(result));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error al enviar datos de la encuesta:", error);
    return false;
  }
};
