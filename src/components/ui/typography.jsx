import { cn } from "@/lib/utils";

const Text14 = ({ className, italic = false, ...props }) => (
  <div
    className={cn("!text-sm !tracking-normal !text-muted-foreground !font-sans", italic && "italic", className)}
    {...props}
  />
);

const CellText = ({ className, italic = false, href, ...props }) => (
  <a
    href={href}
    rel="noopener noreferrer"
    className={cn(
      "!text-sm tracking-normal !font-inter !font-medium !leading-5 text-black",
      italic && "italic",
      className
    )}
    {...props}
  />
);

const CellText2 = ({ className, italic = false, ...props }) => (
  <div
    className={cn("!text-sm tracking-normal !font-inter !font-normal !leading-5", italic && "italic", className)}
    {...props}
  />
);

const Header24 = ({ children, className, ...props }) => (
  <div
    className={cn("text-2xl font-sans font-semibold tracking-[-0.4px] text-foreground whitespace-nowrap", className)}
    {...props}
  >
    {children}
  </div>
);

const Header20 = ({ children, className, ...props }) => (
  <div
    className={cn("text-xl font-sans font-semibold tracking-[-0.4px] text-foreground whitespace-nowrap", className)}
    {...props}
  >
    {children}
  </div>
);

const Header18 = ({ children, className, ...props }) => (
  <div
    className={cn(
      "!text-lg !leading-[1.333] !font-sans !font-semibold !tracking-[-0.4px] !text-foreground !whitespace-nowrap",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const Header16 = ({ children, className, ...props }) => (
  <div className={cn("text-base font-sans font-semibold text-foreground whitespace-nowrap", className)} {...props}>
    {children}
  </div>
);

const Header14 = ({ children, className, ...props }) => (
  <div
    className={cn("text-sm font-sans font-medium tracking-normal text-foreground whitespace-nowrap", className)}
    {...props}
  >
    {children}
  </div>
);

export {
  Text14,
  CellText,
  CellText2,
  Header24,
  Header20,
  Header18,
  Header16,
  Header14,
};
