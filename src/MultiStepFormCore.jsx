import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './MultiStepForm.css';
import { ProgressBar } from './Progressbar';
import { getSteps } from './stepsConfig';
import { useFramerStepAnimation } from './useFramerStepAnimation';

// helper para logs JSON bonitos
const logJson = (label, data) => {
  console.log(`${label}:`, JSON.stringify(data, null, 2));
};

export function MultiStepFormCore({ orden, onSubmit }) {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const fieldsetRef = useRef(null);
  const formRef = useRef(null);

  // 🔹 los steps se calculan según el orden recibido
  const steps = getSteps(orden);
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

            <CurrentStep />

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
                  onClick={() => goToStep(step + 1, 1)}
                  disabled={isAnimating}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit action-button"
                  onClick={() => onSubmit?.(orden)}
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
