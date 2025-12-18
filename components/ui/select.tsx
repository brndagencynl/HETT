import React from "react";

export default function Select({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label ? <label className="field-label">{label}</label> : null}
      <select {...props} className={`select ${className}`.trim()}>
        {children}
      </select>
    </div>
  );
}
