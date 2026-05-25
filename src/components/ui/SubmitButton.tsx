'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SubmitButton({
  label,
  pendingLabel,
  className = '',
  variant = 'primary',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'danger'
      ? 'btn-danger'
      : 'btn-secondary';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variantClass} ${className}`}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {pendingLabel ?? label}
        </>
      ) : (
        label
      )}
    </button>
  );
}
