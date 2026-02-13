import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
}

const Card = ({
  as: Tag = "article",
  className = "",
  children,
  ...rest
}: CardProps) => {
  return (
    <Tag
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Card;
