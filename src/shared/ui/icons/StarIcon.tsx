import { type SVGProps } from "react";

interface StarIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

const StarIcon = ({ filled = false, ...props }: StarIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M10 1.667l2.575 5.218 5.758.84-4.166 4.06.983 5.732L10 14.808l-5.15 2.709.983-5.733-4.166-4.06 5.758-.839L10 1.667Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default StarIcon;
