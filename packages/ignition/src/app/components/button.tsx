import { ButtonHTMLAttributes } from "react";
const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...props}>
    {children}
  </button>
);

export default Button;
