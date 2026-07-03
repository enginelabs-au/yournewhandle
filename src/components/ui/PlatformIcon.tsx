"use client";

import { useState } from "react";
import { platformIconUrl } from "@/lib/platforms-registry";

type PlatformIconProps = {
  slug?: string;
  color: string;
  abbr: string;
  name: string;
  size?: number;
  className?: string;
};

export function PlatformIcon({
  slug,
  color,
  abbr,
  name: _name,
  size = 20,
  className = "",
}: PlatformIconProps) {
  const [failed, setFailed] = useState(false);

  if (!slug || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md text-[10px] font-bold text-white ${className}`}
        style={{ width: size, height: size, backgroundColor: color }}
        aria-hidden
      >
        {abbr.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={platformIconUrl(slug, color)}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
      aria-hidden
    />
  );
}
