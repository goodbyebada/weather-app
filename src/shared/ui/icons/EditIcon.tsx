import { type SVGProps } from "react";

const EditIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M14.167 2.5a2.357 2.357 0 0 1 3.333 3.333L6.25 17.083l-4.583 1.25 1.25-4.583L14.167 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EditIcon;
