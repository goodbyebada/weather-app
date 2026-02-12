import { type SVGProps } from "react";

const LocationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M10 10.833a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10 1.667c-4.167 0-6.667 3.083-6.667 6.666 0 4.584 6.667 10 6.667 10s6.667-5.416 6.667-10c0-3.583-2.5-6.666-6.667-6.666Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default LocationIcon;
