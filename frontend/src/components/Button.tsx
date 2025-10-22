import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import LoadingSpinner from './LoadingSpinner';

// Utility function to merge class names
const cn = (...inputs: ClassValue[]) => clsx(inputs);

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, 'children'> {
  children: React.ReactNode;
  // Custom styling props (renamed to avoid framer-motion name overlap)
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  buttonSize?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  buttonVariant,
  buttonSize,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variantClasses: Record<NonNullable<ButtonProps['buttonVariant']>, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['buttonSize']>, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const isDisabled = disabled || isLoading;

  // Provide gentle defaults only if caller didn't pass motion props
  const defaultWhileHover = props.whileHover ?? (!isDisabled ? { scale: 1.02 } : undefined);
  const defaultWhileTap = props.whileTap ?? (!isDisabled ? { scale: 0.98 } : undefined);
  const defaultTransition = props.transition ?? { duration: 0.1 };

  return (
    <motion.button
      className={cn(
        baseClasses,
        buttonVariant ? variantClasses[buttonVariant] : undefined,
        buttonSize ? sizeClasses[buttonSize] : undefined,
        className
      )}
      disabled={isDisabled}
      whileHover={defaultWhileHover}
      whileTap={defaultWhileTap}
      transition={defaultTransition}
      {...props}
    >
      {isLoading && (
        <motion.div
          className="mr-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingSpinner size="sm" />
        </motion.div>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
