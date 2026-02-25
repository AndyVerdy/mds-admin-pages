import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ActionDropdownMenu = ({
  items,
  triggerIcon = <EllipsisVertical className="!w-4 !h-4" />,
  className = "!py-2 !px-4",
  disabled = false,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      disabled={disabled}
      className={`${className} flex items-center justify-center rounded hover:bg-gray-100`}
    >
      {triggerIcon}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {items.map((item, idx) => (
        <DropdownMenuItem
          key={idx}
          className={item.className || "flex items-center gap-2"}
          onClick={item.onClick}
        >
          {item.icon}
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default ActionDropdownMenu;
