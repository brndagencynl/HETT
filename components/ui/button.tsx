import React from "react";

type Variant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantMap: Record<Variant, string> = {
  primary: "ds-btn--primary",
  secondary: "ds-btn--secondary",
  accent: "ds-btn--accent",
  outline: "ds-btn--secondary", // alias
  ghost: "ds-btn--ghost",
  link: "ds-btn--link",
};

const sizeMap: Record<Size, string> = {
  sm: "ds-btn--sm",
  md: "",
  lg: "ds-btn--lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`ds-btn ${variantMap[variant]} ${sizeMap[size]} ${className}`.trim()}
    />
  );
}
