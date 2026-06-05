import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[0.8125rem] font-medium text-text-muted mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${
            error ? "!border-semantic-red focus:!shadow-[0_0_0_3px_rgba(248,113,113,0.1)]" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-semantic-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
