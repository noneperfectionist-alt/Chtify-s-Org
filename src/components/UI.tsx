import React, { useId } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "glass" | "neumorph";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "glass",
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variant === "glass" &&
          "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
        variant === "neumorph" &&
          "bg-zinc-900 shadow-[10px_10px_20px_#0a0a0a,-10px_-10px_20px_#1a1a1a]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "glass";
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
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    glass: "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none focus-visible:ring-offset-2 ring-offset-background",
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
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-400 ml-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600",
          error && "border-rose-500 focus:ring-rose-500/50 focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-rose-500 ml-1">{error}</p>
      )}
    </div>
  );
};
