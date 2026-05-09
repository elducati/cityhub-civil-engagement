import { InputHTMLAttributes } from 'react';
import Input from '../atoms/Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return <Input label={label} error={error} {...props} />;
}

export default FormField;