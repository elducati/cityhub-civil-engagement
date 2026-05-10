import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-on-surface mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-12 w-full rounded-xl border border-outline bg-surface-base px-4 py-2 text-sm text-on-surface',
            'placeholder:text-on-surface-variant',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-error focus:ring-error focus:border-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-on-surface-variant">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };