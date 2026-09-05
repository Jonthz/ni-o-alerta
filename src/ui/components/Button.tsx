import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'warning' | 'emergency';
type ButtonSize = 'sm' | 'default' | 'lg' | 'xl' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({ className = '', variant = 'default', size = 'default', icon, children, ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-size-${size} ${className}`.trim()} {...props}>
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span className="btn-label">{children}</span>
    </button>
  );
}
