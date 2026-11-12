import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "quiet";

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  quiet: "btn btn-quiet",
};

type ButtonAsLink = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = Omit<ComponentProps<"button">, "className"> & {
  href?: undefined;
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", className = "", children } = props;
  const classes = `${variantClass[variant]} ${className}`.trim();

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _variant, className: _className, ...rest } = props;
  void _href;
  void _variant;
  void _className;

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
