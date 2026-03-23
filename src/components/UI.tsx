import React, { useId } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "glass-dark" | "neumorph";
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "glass",
  glow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variant === "glass" && "glass-card",
        variant === "glass-dark" && "glass-panel",
        variant === "neumorph" && "bg-zinc-900 shadow-[10px_10px_20px_#0a0a0a,-10px_-10px_20px_#1a1a1a]",
        glow && "neon-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "glass" | "glow";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  ...props
}) => {
  const variants = {
    primary: "bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20",
    secondary: "bg-secondary hover:bg-secondary/80 text-foreground",
    danger: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    glass: "glass-card hover:bg-white/10 text-foreground",
    glow: "bg-primary text-white shadow-[0_0_20px_rgba(5,172,209,0.4)] hover:shadow-[0_0_30px_rgba(5,172,209,0.6)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      className={cn(
        "rounded-xl font-bold tracking-tight transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none focus-visible:ring-offset-2 ring-offset-background",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={props.disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        {children}
      </div>
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-zinc-600",
            error && "border-rose-500 focus:ring-rose-500/50 focus:border-rose-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rose-500 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
};
