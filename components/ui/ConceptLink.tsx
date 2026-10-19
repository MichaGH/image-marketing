"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** Retains the source prototype's inactive links until detail-page designs exist. */
export function ConceptLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      prefetch={false}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}
