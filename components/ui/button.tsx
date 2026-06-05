import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    
    const variants = {
      primary: "btn-primary",
      secondary: "glass-sm text-text-primary hover:bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm font-medium transition-colors",
      danger: "btn-primary !bg-none !bg-semantic-red !shadow-glow-red",
      ghost: "btn-ghost",
    };

    // The globals.css handles most sizing internally for btn-primary/btn-ghost.
    // If specific sizes are needed, we can append padding.
    const sizes = {
      sm: "!py-1.5 !px-3 !min-h-0 text-xs",
      md: "",
      lg: "!py-3 !px-6 text-base",
    };

    const classes = `${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={classes} {...props} />
    );
  }
);

Button.displayName = "Button";
