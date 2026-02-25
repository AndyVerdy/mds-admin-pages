import { Eye, LucidePencil, RotateCcw, Link2, Trash } from "lucide-react";
import ActionDropdownMenu from "../../components/dataTable/ActionDropdownMenu";
import CopyButton from "../../components/ui/copy-button";
import { CellText2, Text14 } from "../../components/ui/typography";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function getColumns({ onCopyEmail, onAction }) {
  return [
    {
      accessorKey: "fullName",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original?.user_id;
        const firstName = user?.first_name || "";
        const lastName = user?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim() || "-";
        const photo = user?.profileImg;
        const isOnline = row.original?.isOnline;

        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              {photo ? (
                <img
                  src={photo}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {firstName?.charAt(0) || ""}
                  {lastName?.charAt(0) || ""}
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <CellText2 className="!font-medium">{fullName}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "displayName",
      header: "Display name",
      cell: ({ row }) => {
        const displayName = row.original?.user_id?.display_name;
        return (
          <div className="hover:!cursor-text">
            <CellText2>{displayName || "-"}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "Preferred_Email",
      header: "User email",
      cell: ({ row }) => {
        const user = row.original?.user_id;
        const email = user?.["Preferred Email"] || user?.email;
        if (!email) {
          return (
            <div className="hover:!cursor-text">
              <CellText2>-</CellText2>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <CellText2>{email}</CellText2>
            <CopyButton text={email} onCopy={onCopyEmail} />
          </div>
        );
      },
    },
    {
      accessorKey: "membership",
      header: "Membership",
      cell: ({ row }) => {
        const tierName = row.original?.tier_id?.name;
        return (
          <div className="hover:!cursor-text">
            <CellText2>{tierName || "-"}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "groupos_join_date",
      header: "Joined",
      enableSorting: true,
      cell: ({ row }) => {
        const date = row.original?.groupos_join_date;
        return (
          <div className="hover:!cursor-text">
            <CellText2>{formatDate(date)}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const items = [
          {
            icon: <Eye className="text-black" />,
            label: "View",
            onClick: () => onAction("view", row.original),
          },
          {
            icon: <LucidePencil className="text-black" />,
            label: "Edit",
            onClick: () => onAction("edit", row.original),
          },
          {
            icon: <RotateCcw className="text-black" />,
            label: "Reset Social Login",
            onClick: () => onAction("resetSocial", row.original),
          },
          {
            icon: <Link2 className="text-black" />,
            label: "Connect with member",
            onClick: () => onAction("connect", row.original),
          },
          {
            icon: <Trash className="text-red-500" />,
            label: "Delete",
            className: "!text-red-500 flex items-center gap-2",
            onClick: () => onAction("delete", row.original),
          },
        ];
        return (
          <div className="flex items-center justify-center !max-w-[2.2rem] !min-w-[2.2rem] !w-full">
            <ActionDropdownMenu items={items} />
          </div>
        );
      },
    },
  ];
}
