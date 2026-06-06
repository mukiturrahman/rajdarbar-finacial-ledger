import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-primary !bg-rose-600 hover:!bg-rose-700 !text-white",
      ghost: "btn-ghost",
    };

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
