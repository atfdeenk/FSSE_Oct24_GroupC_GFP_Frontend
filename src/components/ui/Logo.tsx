import Link from "next/link";
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => (
  <Link href="/" className={`text-2xl font-bold text-white mr-10 ${className}`.trim()}>
    bumibrew
  </Link>
);

export default Logo;
