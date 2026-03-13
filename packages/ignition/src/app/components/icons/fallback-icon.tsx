import React from "react";

// Local fallback icon to avoid bundling rocketicons/rc
export const FallbackIcon = ({
  className = "",
  size = 24,
  style = {},
  ...props
}: {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{
      display: "inline-block",
      width: size,
      height: size,
      ...style
    }}
    {...props}
  >
    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
  </svg>
);

export default FallbackIcon;
