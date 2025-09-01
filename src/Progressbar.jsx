import './ProgressBar.css';
import { useProgressbarState } from './useProgressBarState';

export function ProgressBar({ step, labels }) {
  const states = useProgressbarState(step, labels.length);

  return (
    <ul
      className="progressbar"
      role="list"
      aria-label="Progreso del formulario"
    >
      {labels.map((label, idx) => (
        <li
          key={idx}
          className={states[idx]}
          aria-current={idx === step ? 'step' : undefined}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
