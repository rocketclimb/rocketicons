"use client";
import { ButtonHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
const LinkButton = ({
  href,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { href: string }) => {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.push(href)} {...props}>
      {children}
    </button>
  );
};

export default LinkButton;
