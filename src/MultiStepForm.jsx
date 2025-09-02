import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './MultiStepForm.css';
import { ProgressBar } from './Progressbar';
import { useFramerStepAnimation } from './useFramerStepAnimation';

import { getSteps } from './stepsConfig';

// 🔹 helper para logs JSON bonitos
const logJson = (label, data) => {
  console.log(`${label}:`, JSON.stringify(data, null, 2));
};

// 🔹 función para simular requests
const simulateRequest = async (endpoint, body) => {
  console.log(`📡 Simulación POST ${endpoint}`);
  logJson('Request body', body);

  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeId = Math.random().toString(36).substring(2, 10);
      const response = { _id: fakeId };
      logJson('✅ Simulación response', response);
      resolve(response);
    }, 500);
  });
};

/**
 * MultiStepForm dinámico
 * @param {Object} props
 * @param {Array} props.steps - Configuración de pasos [{id, title, subtitle, Component}]
 */
export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const [formData, setFormData] = useState({});
  const [ids, setIds] = useState({});

  const fieldsetRef = useRef(null);
  const formRef = useRef(null);

  // 🔹 cada render los steps se recalculan según formData
  const steps = getSteps(formData);

  // focus automático en el primer input
  useEffect(() => {
    if (fieldsetRef.current) {
      const firstInput = fieldsetRef.current.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }
  }, [step]);

  // animar altura del form
  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    const activeFieldset = formEl.querySelector('fieldset');
    if (!activeFieldset) return;

    const to = activeFieldset.scrollHeight;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    formEl.style.height = prefersReduced ? `${to}px` : `${to}px`;
  }, [step]);

  const goToStep = (newStep, direction) => {
    const target = Math.min(Math.max(newStep, 0), steps.length - 1);

    if (isAnimating) {
      setPendingStep({ step: target, dir: direction });
      return;
    }

    setIsAnimating(true);
    setPrevDirection(direction);
    setStep(target);

    setTimeout(() => {
      setIsAnimating(false);
      if (pendingStep) {
        const { step: pStep, dir } = pendingStep;
        setPendingStep(null);
        goToStep(pStep, dir);
      }
    }, 650);
  };

  const handleNext = async () => {
    const currentStep = steps[step];
    const data = formData[currentStep.id] || {};

    if (currentStep.id === 'cliente') {
      const res = await simulateRequest('/clientes', data);
      setIds((prev) => ({ ...prev, clienteId: res._id }));
    }

    if (currentStep.id === 'ficha-tecnica') {
      // 🔹 combinamos equipo + ficha tecnica
      const equipoData = formData['equipo'] || {};
      const fichaData = data;

      const res = await simulateRequest('/equipos', {
        ...equipoData,
        clienteActual: ids.clienteId,
        permitirCrearFichaTecnicaManual: false,
        fichaTecnicaManual: fichaData,
      });

      setIds((prev) => ({ ...prev, equipoId: res._id }));
    }

    if (currentStep.id === 'orden-servicio') {
      await simulateRequest('/ordenes-servicio', {
        ...data,
        cliente: ids.clienteId,
        equipo: ids.equipoId,
      });
    }

    goToStep(step + 1, 1);
  };

  const goPrev = () => goToStep(step - 1, -1);

  const variants = useFramerStepAnimation({
    durations: { step: 0.8 },
    debug: false,
  });

  const CurrentStep = steps[step]?.Component ?? (() => <p>No hay pasos</p>);

  return (
    <div className="form-wrapper">
      <ProgressBar step={step} labels={steps.map((s) => s.title)} />

      <motion.form
        className="msform"
        ref={formRef}
        layout
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (e.shiftKey) {
              goPrev();
            } else if (step < steps.length - 1) {
              handleNext();
            } else {
              logJson('Form submitted!', { ...formData, ids });
            }
          }
        }}
      >
        <AnimatePresence mode="sync" initial={false} custom={prevDirection}>
          <motion.fieldset
            key={step}
            ref={fieldsetRef}
            custom={prevDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            layout
          >
            <legend className="sr-only">{steps[step]?.title}</legend>
            <h2 className="fs-title">{steps[step]?.title}</h2>
            <h3 className="fs-subtitle">{steps[step]?.subtitle}</h3>

            <CurrentStep
              values={formData[steps[step].id] || {}}
              onChange={(vals) =>
                setFormData((prev) => ({ ...prev, [steps[step].id]: vals }))
              }
            />

            <div>
              {step > 0 && (
                <button
                  type="button"
                  className="previous action-button"
                  onClick={goPrev}
                  disabled={isAnimating}
                >
                  Previous
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  className="next action-button"
                  onClick={handleNext}
                  disabled={isAnimating}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit action-button"
                  onClick={async () => {
                    // 🔹 mapeamos el formData + ids al payload final requerido
                    const finalPayload = {
                      representanteId: ids.clienteId, // viene del paso cliente
                      equipoId: ids.equipoId, // viene del paso equipo (ya con ficha)
                      lineasServicio: [
                        {
                          tipoTrabajo: '68afd6a2c19b8c72a13decb0', // ⚡️ ojo: este id debe venir de un select real en tu Step4
                          nombreTrabajo:
                            formData['orden-servicio']?.nombreTrabajo || '',
                          descripcion:
                            formData['orden-servicio']?.diagnostico || '',
                          precioUnitario: Number(
                            formData['orden-servicio']?.precioUnitario || 0
                          ),
                          cantidad: Number(
                            formData['orden-servicio']?.cantidad || 1
                          ),
                        },
                      ],
                      tecnico: '681b7df58ea5aadc2aa6f420', // ⚡️ igual: debería salir de un select en el formulario
                      total: Number(formData['orden-servicio']?.total || 0),
                      fechaIngreso:
                        formData['orden-servicio']?.fechaIngreso ||
                        new Date().toISOString(),
                      diagnosticoCliente:
                        formData['orden-servicio']?.diagnostico || '',
                      observaciones:
                        formData['orden-servicio']?.observaciones || '',
                    };

                    // 🔹 enviamos a nuestro simulateRequest (como si fuera el backend real)
                    await simulateRequest(
                      '/ordenes-servicio/final',
                      finalPayload
                    );

                    logJson('✅ Payload final listo para enviar', finalPayload);
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </motion.fieldset>
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
