import React from "react";

type Padding = "tight" | "normal" | "wide";

export function Card({
  children,
  padding = "normal",
  className = "",
}: {
  children: React.ReactNode;
  padding?: Padding;
  className?: string;
}) {
  const pad = padding === "tight" ? "ui-card--tight" : padding === "wide" ? "ui-card--wide" : "ui-card--normal";
  return <div className={`ui-card ${pad} ${className}`.trim()}>{children}</div>;
}
