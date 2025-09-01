import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import './MultiStepForm.css';
import { ProgressBar } from './Progressbar';
import { useFramerStepAnimation } from './useFramerStepAnimation';

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [prevDirection, setPrevDirection] = useState(0);

  // protecciones stress test
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);

  const fieldsetRef = useRef(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (fieldsetRef.current) {
      const firstInput = fieldsetRef.current.querySelector('input, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [step]);

  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    const activeFieldset = formEl.querySelector('fieldset');
    if (!activeFieldset) return;

    const to = activeFieldset.scrollHeight;

    // ⚡ detectar reduce motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // 🚨 sin animación → salto directo
      formEl.style.height = `${to}px`;
      return;
    }

    // 🚀 por ahora: mismo comportamiento (salto inmediato)
    // más adelante aquí metemos WAAPI para interpolar suavemente
    formEl.style.height = `${to}px`;
  }, [step]);

  const steps = [
    {
      title: 'Crear Cliente',
      subtitle: 'Ingresa datos de cliente',
      Component: Step1,
    },
    {
      title: 'Crear Equipo',
      subtitle: 'Ingresa datos de equipo',
      Component: Step2,
    },
    {
      title: 'Personal Details',
      subtitle: 'We will never sell it',
      Component: Step3,
    },
  ];

  // función segura con clamp + pending
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
    }, 650); // duración animación CSS
  };

  const goNext = () => goToStep(step + 1, 1);
  const goPrev = () => goToStep(step - 1, -1);

  const variants = useFramerStepAnimation({
    durations: { step: 0.8 },
    debug: true,
  });

  const CurrentStep = steps[step].Component;

  return (
    <div className="form-wrapper">
      <ProgressBar
        step={step}
        labels={['Account Setup', 'Social Profiles', 'Personal Details']}
      />

      <motion.form
        className="msform"
        ref={formRef}
        layout // 👈 esta prop hace que la altura se anime automáticamente
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (e.shiftKey) {
              goPrev();
            } else if (step < steps.length - 1) {
              goNext();
            } else {
              console.log('Form submitted!');
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
            layout // 👈 también aquí si quieres que cada fieldset haga animaciones de tamaño internas
          >
            <legend className="sr-only">{steps[step].title}</legend>
            <h2 className="fs-title">{steps[step].title}</h2>
            <h3 className="fs-subtitle">{steps[step].subtitle}</h3>
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
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  className="next action-button"
                  onClick={goNext}
                  disabled={isAnimating}
                >
                  Next
                </button>
              ) : (
                <button type="submit" className="submit action-button">
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
