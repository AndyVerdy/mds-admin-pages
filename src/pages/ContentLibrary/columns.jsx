import { Clipboard, LucidePencil, Trash } from "lucide-react";
import { OutlineBadge } from "../../components/ui/badge";
import { CellText2, Text14 } from "../../components/ui/typography";
import CellView from "../../components/CellView";
import ActionDropdownMenu from "../../components/dataTable/ActionDropdownMenu";

// Build full URL for thumbnails/videos stored as relative paths
function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://mds-community.s3.amazonaws.com/${path}`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function getStatusInfo(video) {
  const uploadStatus = (video?.uploadstatus || "").toLowerCase();

  if (uploadStatus === "completed" || uploadStatus === "published") {
    return { label: "Published", className: "!bg-[#DCFCE7] !border !border-[#22C55E]" };
  }
  if (uploadStatus === "paused") {
    return { label: "Paused", className: "!bg-[#F5F5F4]" };
  }
  if (uploadStatus === "draft" || uploadStatus === "pending") {
    return { label: "Draft", className: "!bg-[#F5F5F4]" };
  }
  return { label: uploadStatus || "-", className: "!bg-[#F5F5F4]" };
}

export function getColumns({ onAction }) {
  return [
    {
      accessorKey: "video",
      header: "Video",
      enableSorting: true,
      meta: {
        exportValue: (row) => row?.title || "Untitled",
      },
      cell: ({ row }) => {
        const video = row.original;
        const title = video?.title || "Untitled";
        const thumbnail = assetUrl(video?.thumbnail);
        const videoId = video?._id;
        const subdomain = import.meta.env.VITE_SUBDOMAIN || "app";
        const domain = import.meta.env.VITE_GATEWAY_DOMAIN || "mds.co";
        const appUrl = videoId
          ? `https://${subdomain}.${domain}/videos/${videoId}`
          : "";

        return (
          <span className="!min-w-60 !max-w-60 w-full">
            <CellView
              variant="imageTitleUrlV2"
              image={thumbnail}
              title={title}
              href={`/admin/contentlibrary/edit/${videoId}`}
              url={appUrl}
            />
          </span>
        );
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      enableSorting: true,
      meta: {
        exportValue: (row) => {
          const views = row?.views;
          return (row?.starting_view_cnt || 0) + (Array.isArray(views) ? views.length : 0);
        },
      },
      cell: ({ row }) => {
        const views = row.original?.views;
        const count =
          (row.original?.starting_view_cnt || 0) +
          (Array.isArray(views) ? views.length : 0);
        return (
          <div className="!max-w-32 !min-w-32 !w-full hover:!cursor-text">
            <CellText2>{count > 0 ? count.toLocaleString() : "—"}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
      enableSorting: true,
      meta: {
        exportValue: (row) => {
          const comments = row?.comments;
          return Array.isArray(comments) ? comments.length : 0;
        },
      },
      cell: ({ row }) => {
        const comments = row.original?.comments;
        const count = Array.isArray(comments) ? comments.length : 0;
        return (
          <div className="!max-w-32 !min-w-32 !w-full hover:!cursor-text">
            <CellText2>{count > 0 ? count.toLocaleString() : "—"}</CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "access",
      header: "Access",
      meta: {
        exportValue: (row) => {
          const access = (row?.restrictionAccess || "public").toLowerCase();
          return access === "restricted" ? "Restricted" : "Public";
        },
      },
      cell: ({ row }) => {
        const access = (
          row.original?.restrictionAccess || "public"
        ).toLowerCase();
        return (
          <div className="!max-w-32 !min-w-32 !w-full hover:!cursor-text">
            <CellText2 className="!capitalize">
              {access === "restricted" ? "Restricted" : "Public"}
            </CellText2>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded",
      enableSorting: true,
      meta: {
        exportValue: (row) => {
          const p = formatDate(row?.createdAt);
          return p ? `${p.date} ${p.time}` : "";
        },
      },
      cell: ({ row }) => {
        const parsed = formatDate(row.original?.createdAt);
        if (!parsed) {
          return (
            <div className="!max-w-32 !min-w-32 !w-full hover:!cursor-text">
              <CellText2>—</CellText2>
            </div>
          );
        }
        return (
          <div className="!max-w-32 !min-w-32 !w-full flex flex-col hover:!cursor-text">
            <CellText2>{parsed.date}</CellText2>
            <Text14>{parsed.time}</Text14>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last update",
      enableSorting: true,
      meta: {
        exportValue: (row) => {
          const p = formatDate(row?.updatedAt);
          return p ? `${p.date} ${p.time}` : "";
        },
      },
      cell: ({ row }) => {
        const parsed = formatDate(row.original?.updatedAt);
        if (!parsed) {
          return (
            <div className="!max-w-32 !min-w-32 !w-full hover:!cursor-text">
              <CellText2>—</CellText2>
            </div>
          );
        }
        return (
          <div className="!max-w-32 !min-w-32 !w-full flex flex-col hover:!cursor-text">
            <CellText2>{parsed.date}</CellText2>
            <Text14>{parsed.time}</Text14>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      meta: {
        exportValue: (row) => getStatusInfo(row).label,
      },
      cell: ({ row }) => {
        const { label, className } = getStatusInfo(row.original);
        return (
          <div className="!max-w-26 !min-w-26 !w-full hover:!cursor-text">
            <OutlineBadge className={`${className} !capitalize`}>
              {label}
            </OutlineBadge>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const video = row.original;

        const items = [
          {
            icon: <LucidePencil className="text-black" />,
            label: "Edit",
            onClick: () => onAction("edit", video),
          },
          {
            icon: <Clipboard className="text-black" />,
            label: "Duplicate",
            onClick: () => onAction("duplicate", video),
          },
          {
            icon: <Trash className="text-red-500" />,
            label: "Delete",
            className: "!text-red-500 flex items-center gap-2",
            onClick: () => onAction("delete", video),
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
