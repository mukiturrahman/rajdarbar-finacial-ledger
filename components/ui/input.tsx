import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, onChange, ...props }, ref) => {
    const isNumberType = props.type === "number";
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumberType) {
        let val = e.target.value;
        // Allow only numbers, decimal points, and minus sign
        val = val.replace(/[^0-9.-]/g, "");
        // Prevent minus sign anywhere except at the start
        if (val.indexOf("-") > 0) {
          val = val.charAt(0) + val.slice(1).replace(/-/g, "");
        }
        // Prevent multiple decimal points
        const parts = val.split(".");
        if (parts.length > 2) {
          val = parts[0] + "." + parts.slice(1).join("");
        }
        e.target.value = val;
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-[0.8125rem] font-medium text-text-muted mb-1.5 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-field ${
            error ? "!border-semantic-red focus:!border-semantic-red" : ""
          } ${className}`}
          {...props}
          type={isNumberType ? "text" : props.type}
          inputMode={isNumberType ? "decimal" : props.inputMode}
          onChange={handleChange}
        />
        {error && <p className="mt-1.5 text-xs text-semantic-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
