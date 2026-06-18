'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Star } from 'lucide-react';

export default function SatisfactionSurvey() {
  const { user } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [responses, setResponses] = useState({
    satisfaction: Array(5).fill(0),
    consumption: {
      frequency: '',
    },
    deliveryExperience: Array(5).fill(0),
    feedback: {
      reasonToChoose: '',
      tryNewProducts: '',
      consideredChanging: '',
    },
  });

  const satisfactionQuestions = [
    { text: "¿Qué tan satisfecho estás con el sabor de nuestras pizzas?" },
    { text: "¿Qué tan satisfecho estás con el tiempo de entrega o atención?" },
    { text: "¿Qué tan satisfecho estás con la variedad de productos disponibles?" },
    { text: "¿Qué tan satisfecho estás con los precios en comparación a la calidad?" },
    { text: "¿Qué tan satisfecho estás con la atención al cliente?" },
  ];

  const deliveryExperienceQuestions = [
    { text: "¿Qué tan fácil te resulta hacer un pedido?", rating: ['Muy Difícil', 'Difícil', 'Normal', 'Fácil', 'Muy Fácil'] },
    { text: "¿Qué tan puntual suele ser la entrega o atención en el local?", rating: ['Muy Lento', 'Lento', 'A tiempo', 'Rápido', 'Muy Rápido'] },
    { text: "¿Qué tan bien empaquetado llega tu pedido?", rating: ['Muy Malo', 'Malo', 'Normal', 'Bueno', 'Muy Bueno'] },
    { text: "¿Qué tan precisos son los pedidos (sin errores)?", rating: ['Impreciso', 'Poco Preciso', 'Normal', 'Preciso', 'Muy Preciso'] },
    { text: "¿Qué tan probable es que recomiendes nuestra pizzería a otros?", rating: ['Muy Improbable', 'Improbable', 'Probable', 'Muy Probable', 'Definitivamente'] },
  ];

  const handleRateSatisfaction = (index: number, rating: number) => {
    const updated = [...responses.satisfaction];
    updated[index] = rating;
    setResponses({ ...responses, satisfaction: updated });
  };

  const handleRateDelivery = (index: number, rating: number) => {
    const updated = [...responses.deliveryExperience];
    updated[index] = rating;
    setResponses({ ...responses, deliveryExperience: updated });
  };

  const submitSurvey = async () => {
    // Validate
    const allSatisfactionRated = responses.satisfaction.every(r => r > 0);
    const allDeliveryRated = responses.deliveryExperience.every(r => r > 0);
    const hasFrequency = !!responses.consumption.frequency;
    const hasReason = !!responses.feedback.reasonToChoose;
    const hasTryNew = !!responses.feedback.tryNewProducts;
    const hasChanged = !!responses.feedback.consideredChanging;

    if (!allSatisfactionRated || !allDeliveryRated || !hasFrequency || !hasReason || !hasTryNew || !hasChanged) {
      setWarningMessage('Por favor, completa todas las preguntas antes de enviar.');
      setTimeout(() => setWarningMessage(null), 5000);
      return;
    }

    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_cliente: user.id,
        id_encuesta: 1,
        respuestas: responses
      };

      const res = await fetch('/api/forms/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setDialogVisible(false);
        }, 2000);
      } else {
        throw new Error('Error saving survey');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Hubo un error al enviar la encuesta. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!dialogVisible) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#12121b] border border-theme rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-theme flex justify-between items-center bg-[#181825]">
          <h1 className="text-2xl font-extrabold text-ctp-mauve font-pizza-title tracking-wider">
            Satisfacción del Cliente 🍕
          </h1>
          <button
            onClick={() => setDialogVisible(false)}
            className="text-theme-text/70 hover:text-ctp-red transition-colors p-2 rounded-lg hover:bg-theme-surface"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <span className="text-6xl animate-bounce">🎉</span>
              <h2 className="text-2xl font-bold text-ctp-green">¡Encuesta Enviada con Éxito!</h2>
              <p className="text-sm text-theme-text/80">Agradecemos sinceramente tu tiempo y comentarios.</p>
            </div>
          ) : (
            <>
              {warningMessage && (
                <div className="p-4 rounded-xl bg-ctp-yellow/20 border border-ctp-yellow text-ctp-yellow text-sm font-semibold text-center animate-pulse">
                  ⚠️ {warningMessage}
                </div>
              )}

              {/* Section 1: Satisfacción General */}
              <div className="p-6 rounded-2xl bg-theme-surface/40 border border-theme/60 space-y-4">
                <h2 className="text-lg font-bold text-ctp-blue flex items-center gap-2">
                  <span>✨</span> Sección 1: Satisfacción General
                </h2>
                <div className="space-y-4">
                  {satisfactionQuestions.map((question, qIdx) => (
                    <div key={qIdx} className="space-y-2 border-b border-theme/35 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-theme-text">{question.text}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateSatisfaction(qIdx, star)}
                              className="text-ctp-yellow hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={20}
                                fill={star <= responses.satisfaction[qIdx] ? 'currentColor' : 'transparent'}
                              />
                            </button>
                          ))}
                        </div>
                        {responses.satisfaction[qIdx] > 0 && (
                          <span className="text-xs font-bold text-ctp-yellow bg-ctp-yellow/10 px-2.5 py-0.5 rounded-full">
                            {['Muy Insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy Satisfecho'][responses.satisfaction[qIdx] - 1]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Frecuencia de Consumo */}
              <div className="p-6 rounded-2xl bg-theme-surface/40 border border-theme/60 space-y-4">
                <h2 className="text-lg font-bold text-ctp-green flex items-center gap-2">
                  <span>🍕</span> Sección 2: Preferencias de Consumo
                </h2>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-theme-text">¿Con qué frecuencia consumes nuestras pizzas?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: '1', text: 'Más de una vez por semana' },
                      { label: '2', text: 'Una vez por semana' },
                      { label: '3', text: 'Dos veces al mes' },
                      { label: '4', text: 'Una vez al mes' },
                      { label: '5', text: 'Menos de una vez al mes' },
                    ].map((option) => (
                      <label
                        key={option.label}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                          responses.consumption.frequency === option.label
                            ? 'bg-ctp-green/20 border-ctp-green text-ctp-green'
                            : 'bg-theme-card/50 border-theme hover:bg-theme-surface/75 text-theme-text/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={option.label}
                          checked={responses.consumption.frequency === option.label}
                          onChange={(e) => setResponses({
                            ...responses,
                            consumption: { ...responses.consumption, frequency: e.target.value }
                          })}
                          className="hidden"
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Entrega y Pedidos */}
              <div className="p-6 rounded-2xl bg-theme-surface/40 border border-theme/60 space-y-4">
                <h2 className="text-lg font-bold text-ctp-peach flex items-center gap-2">
                  <span>🚚</span> Sección 3: Experiencia de Pedido y Entrega
                </h2>
                <div className="space-y-4">
                  {deliveryExperienceQuestions.map((question, qIdx) => (
                    <div key={qIdx} className="space-y-2 border-b border-theme/35 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-theme-text">{question.text}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateDelivery(qIdx, star)}
                              className="text-ctp-yellow hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={20}
                                fill={star <= responses.deliveryExperience[qIdx] ? 'currentColor' : 'transparent'}
                              />
                            </button>
                          ))}
                        </div>
                        {responses.deliveryExperience[qIdx] > 0 && (
                          <span className="text-xs font-bold text-ctp-peach bg-ctp-peach/10 px-2.5 py-0.5 rounded-full">
                            {question.rating[responses.deliveryExperience[qIdx] - 1]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Retroalimentación */}
              <div className="p-6 rounded-2xl bg-theme-surface/40 border border-theme/60 space-y-6">
                <h2 className="text-lg font-bold text-ctp-red flex items-center gap-2">
                  <span>💬</span> Sección 4: Opinión y Retroalimentación
                </h2>

                {/* Motivo */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-theme-text">¿Cuál es tu principal motivo para elegirnos frente a otras pizzerías?</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: '10', text: 'Sabor' },
                      { label: '11', text: 'Variedad' },
                      { label: '12', text: 'Precio' },
                      { label: '13', text: 'Promociones' },
                      { label: '14', text: 'Atención al cliente' },
                    ].map((option) => (
                      <label
                        key={option.label}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                          responses.feedback.reasonToChoose === option.label
                            ? 'bg-ctp-red/20 border-ctp-red text-ctp-red'
                            : 'bg-theme-card/50 border-theme hover:bg-theme-surface/75 text-theme-text/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reasonToChoose"
                          value={option.label}
                          checked={responses.feedback.reasonToChoose === option.label}
                          onChange={(e) => setResponses({
                            ...responses,
                            feedback: { ...responses.feedback, reasonToChoose: e.target.value }
                          })}
                          className="hidden"
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Probar nuevos productos */}
                <div className="space-y-3 border-t border-theme/35 pt-4">
                  <p className="text-sm font-medium text-theme-text">¿Qué tan probable es que pruebes nuevos productos o promociones?</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: '15', text: 'Muy probable' },
                      { label: '16', text: 'Algo probable' },
                      { label: '17', text: 'No muy probable' },
                      { label: '18', text: 'No lo haría' },
                    ].map((option) => (
                      <label
                        key={option.label}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                          responses.feedback.tryNewProducts === option.label
                            ? 'bg-ctp-red/20 border-ctp-red text-ctp-red'
                            : 'bg-theme-card/50 border-theme hover:bg-theme-surface/75 text-theme-text/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tryNewProducts"
                          value={option.label}
                          checked={responses.feedback.tryNewProducts === option.label}
                          onChange={(e) => setResponses({
                            ...responses,
                            feedback: { ...responses.feedback, tryNewProducts: e.target.value }
                          })}
                          className="hidden"
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cambiar de Pizzería */}
                <div className="space-y-3 border-t border-theme/35 pt-4">
                  <p className="text-sm font-medium text-theme-text">¿Has considerado cambiar a otra pizzería en los últimos 3 meses?</p>
                  <div className="flex gap-4">
                    {[
                      { label: '19', text: 'Sí' },
                      { label: '20', text: 'No' },
                    ].map((option) => (
                      <label
                        key={option.label}
                        className={`flex items-center justify-center w-20 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                          responses.feedback.consideredChanging === option.label
                            ? 'bg-ctp-red/20 border-ctp-red text-ctp-red'
                            : 'bg-theme-card/50 border-theme hover:bg-theme-surface/75 text-theme-text/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="consideredChanging"
                          value={option.label}
                          checked={responses.feedback.consideredChanging === option.label}
                          onChange={(e) => setResponses({
                            ...responses,
                            feedback: { ...responses.feedback, consideredChanging: e.target.value }
                          })}
                          className="hidden"
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!success && (
          <div className="p-6 border-t border-theme bg-[#181825] flex justify-end">
            <button
              onClick={submitSurvey}
              disabled={loading}
              className="px-8 py-3 bg-ctp-mauve text-white text-sm font-bold rounded-xl shadow-lg hover:scale-105 duration-200 transition-transform pulse-button cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Encuesta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
