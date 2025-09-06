import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './MultiStepForm.css';
import { ProgressBar } from './Progressbar';
import { getSteps } from './stepsConfig';
import { useFramerStepAnimation } from './useFramerStepAnimation';

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

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const [formData, setFormData] = useState({});
  const [ids, setIds] = useState({});

  const fieldsetRef = useRef(null);
  const formRef = useRef(null);

  // 🔹 recalculamos steps cada vez que cambia formData
  const steps = getSteps(formData);
  const visibleSteps = steps.filter((s) => !s.hidden);

  // focus automático en el primer input
  useEffect(() => {
    if (fieldsetRef.current) {
      const firstInput = fieldsetRef.current.querySelector(
        'input, textarea, select'
      );
      if (firstInput) firstInput.focus();
    }
  }, [step]);

  const goToStep = (newStep, direction) => {
    const target = Math.min(Math.max(newStep, 0), visibleSteps.length - 1);

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
    const currentStep = visibleSteps[step];
    const data = formData[currentStep.id] || {};

    if (currentStep.id === 'cliente') {
      const res = await simulateRequest('/clientes', data);
      setIds((prev) => ({ ...prev, clienteId: res._id }));
    }

    if (currentStep.id === 'ficha-tecnica') {
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

  const goPrev = () => {
    goToStep(step - 1, -1);
  };

  const variants = useFramerStepAnimation({
    durations: { step: 0.8 },
    debug: false,
  });

  const CurrentStep =
    visibleSteps[step]?.Component ?? (() => <p>No hay pasos</p>);

  return (
    <div className="form-wrapper">
      <ProgressBar step={step} labels={visibleSteps.map((s) => s.title)} />

      <motion.form
        className="msform"
        ref={formRef}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onSubmit={(e) => e.preventDefault()}
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
            layout="position"
          >
            <legend className="sr-only">{visibleSteps[step]?.title}</legend>
            <h2 className="fs-title">{visibleSteps[step]?.title}</h2>
            <h3 className="fs-subtitle">{visibleSteps[step]?.subtitle}</h3>

            <CurrentStep
              values={formData[visibleSteps[step].id] || {}}
              onChange={(name, value) => {
                console.log('📥 MultiStepForm.onChange:', {
                  id: visibleSteps[step].id,
                  name,
                  value,
                  type: typeof name,
                });
                setFormData((prev) => ({
                  ...prev,
                  [visibleSteps[step].id]: {
                    ...prev[visibleSteps[step].id],
                    [name]: value,
                  },
                }));
              }}
              fields={visibleSteps[step].fields || []}
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
              {step < visibleSteps.length - 1 ? (
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
                    const lineasServicio = formData['linea-extra']
                      ? [formData['linea-extra']]
                      : [];

                    const finalPayload = {
                      representanteId: ids.clienteId,
                      equipoId: ids.equipoId,
                      lineasServicio,
                      tecnico: '681b7df58ea5aadc2aa6f420',
                      total: Number(formData['orden-servicio']?.total || 0),
                      fechaIngreso:
                        formData['orden-servicio']?.fechaIngreso ||
                        new Date().toISOString(),
                      diagnosticoCliente:
                        formData['orden-servicio']?.diagnostico || '',
                      observaciones:
                        formData['orden-servicio']?.observaciones || '',
                    };

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
