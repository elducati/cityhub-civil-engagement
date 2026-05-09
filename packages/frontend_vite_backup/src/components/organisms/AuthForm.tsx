import { ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
}

export default function AuthForm({ title, children, footer, error }: AuthFormProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{title}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}