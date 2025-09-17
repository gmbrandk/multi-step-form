// components/StepWizardCore.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useFramerStepAnimation } from '../logic/useFramerStepAnimation';
import { getClienteService } from '../services/clienteService';
import { ProgressBar } from './Progressbar';

export function StepWizardCore({
  steps,
  onStepSubmit,
  onFinalSubmit,
  getNextLabel, // 👈 NUEVO
  getPrevLabel, // 👈 opcional
  getSubmitLabel, // 👈 opcional
}) {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const providerInfo =
    getClienteService().obtenerNombreProveedor?.() || 'desconocido';
  const providerType = getClienteService().obtenerTipoProveedor?.() || '';

  const fieldsetRef = useRef(null);

  const visibleSteps = steps.filter((s) => !s.hidden);
  const CurrentStep =
    visibleSteps[step]?.Component ?? (() => <p>No hay pasos</p>);

  const current = visibleSteps[step];

  // auto-focus en cada step
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
    const done = await onStepSubmit?.(current);
    if (done !== false) {
      goToStep(step + 1, 1);
    }
  };

  const goPrev = () => {
    goToStep(step - 1, -1);
  };

  const variants = useFramerStepAnimation({
    durations: { step: 0.8 },
    debug: false,
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: providerType === 'mock' ? '#ffe58f' : '#91d5ff',
          color: '#000',
          fontSize: '0.8rem',
          fontWeight: 'bold',
        }}
      >
        {providerInfo} ({providerType})
      </div>
      <div className="form-wrapper">
        <ProgressBar step={step} labels={visibleSteps.map((s) => s.title)} />

        <div className="msform">
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

              <CurrentStep />

              <div>
                {step > 0 && (
                  <button
                    type="button"
                    className="previous action-button"
                    onClick={goPrev}
                    disabled={isAnimating}
                  >
                    {getPrevLabel ? getPrevLabel(current) : 'Previous'}
                  </button>
                )}
                {step < visibleSteps.length - 1 ? (
                  <button
                    type="button"
                    className="next action-button"
                    onClick={handleNext}
                    disabled={isAnimating}
                  >
                    {getNextLabel ? getNextLabel(current) : 'Next'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="submit action-button"
                    onClick={onFinalSubmit}
                  >
                    {getSubmitLabel ? getSubmitLabel(current) : 'Submit'}
                  </button>
                )}
              </div>
            </motion.fieldset>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
