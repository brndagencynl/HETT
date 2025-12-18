import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  surface?: boolean;
};

export default function Input({ label, surface = false, className = "", ...props }: Props) {
  return (
    <div>
      {label ? <label className="field-label">{label}</label> : null}
      <input
        {...props}
        className={`input ${surface ? "input--surface" : ""} ${className}`.trim()}
      />
    </div>
  );
}
