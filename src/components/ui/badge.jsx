import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        outline: "text-foreground hover:cursor-pointer",
        neutral: "bg-gray-100 text-foreground hover:cursor-pointer",
        success: "!border-[#22C55E] !bg-[#DCFCE7] text-foreground hover:cursor-pointer",
        info: "!border-[#0EA5E9] !bg-[#E0F2FE] text-foreground hover:cursor-pointer",
        warning: "!border-[#F59E0B] !bg-[#FEF3C7] text-foreground hover:cursor-pointer",
        danger: "!border-[#EF4444] !bg-[#FEE2E2] text-foreground hover:cursor-pointer",
        muted: "!bg-[#F5F5F4] !border-[#E7E5E4] text-foreground hover:cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const OutlineBadge = (props) => <Badge variant="outline" {...props} />;
const NeutralBadge = (props) => <Badge variant="neutral" {...props} />;
const SuccessBadge = (props) => <Badge variant="success" {...props} />;
const InfoBadge = (props) => <Badge variant="info" {...props} />;
const WarningBadge = (props) => <Badge variant="warning" {...props} />;
const DangerBadge = (props) => <Badge variant="danger" {...props} />;

export {
  Badge,
  badgeVariants,
  OutlineBadge,
  NeutralBadge,
  SuccessBadge,
  InfoBadge,
  WarningBadge,
  DangerBadge,
};
