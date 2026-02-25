import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  CircleDollarSign,
  Newspaper,
  CalendarDays,
  Handshake,
  FileText,
  PlaySquare,
  MessageSquare,
  Bell,
  Images,
  LayoutGrid,
  User,
  CircleHelp,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

// --- MENU CONFIGURATION ---
const SECTIONS = [
  {
    id: "home",
    name: "Home",
    icon: Home,
    slug: "/home",
    disabled: true,
  },
  {
    id: "audience",
    name: "Audience",
    icon: Users,
    slug: "/leads",
    subPages: [
      { name: "Members", path: "/members", disabled: true },
      { name: "Lead Users", path: "/leads" },
      { name: "Invited members", path: "/invited", disabled: true },
      { name: "Guest", path: "/guest", disabled: true },
      { name: "Deleted members", path: "/deleted-members", disabled: true },
      { name: "Approval request", path: "/approval", disabled: true },
      { name: "Team users invitees", path: "/invitees", disabled: true },
      { name: "Blocked members", path: "/blocked", disabled: true },
    ],
    settings: [{ name: "Custom fields", path: "/custom-fields", disabled: true }],
  },
  {
    id: "finances",
    name: "Finances",
    icon: CircleDollarSign,
    slug: "/finances",
    disabled: true,
  },
  {
    id: "newsroom",
    name: "Newsroom",
    icon: Newspaper,
    slug: "/newsroom",
    disabled: true,
  },
  {
    id: "events",
    name: "Events",
    icon: CalendarDays,
    slug: "/events",
    disabled: true,
  },
  {
    id: "partners",
    name: "Partners",
    icon: Handshake,
    slug: "/partners",
    disabled: true,
  },
  {
    id: "documents",
    name: "Documents",
    icon: FileText,
    slug: "/documents",
    disabled: true,
  },
  {
    id: "videos",
    name: "Videos",
    icon: PlaySquare,
    slug: "/content-library",
    subPages: [
      { name: "All videos", path: "/content-library" },
      { name: "Deleted videos", path: "/deleted-videos", disabled: true },
    ],
    settings: [
      { name: "Categories", path: "/video-categories", disabled: true },
      { name: "Speakers", path: "/video-speakers", disabled: true },
    ],
  },
  {
    id: "chat",
    name: "Chat",
    icon: MessageSquare,
    slug: "/chat",
    disabled: true,
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    slug: "/notifications",
    disabled: true,
  },
  {
    id: "gallery",
    name: "Photo gallery",
    icon: Images,
    slug: "/gallery",
    disabled: true,
  },
  {
    id: "pages",
    name: "Pages",
    icon: LayoutGrid,
    slug: "/pages",
    disabled: true,
  },
  {
    id: "community",
    name: "Community",
    icon: User,
    slug: "/community",
    disabled: true,
  },
];

const BOTTOM_ITEMS = [
  { id: "help", name: "Get started", icon: CircleHelp, disabled: true },
];

// --- ICON SIDEBAR (left strip) ---
function IconSidebar({ activeSection, onSectionClick }) {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center w-12 min-w-[3rem] border-r border-[#E5E5E5] bg-white h-full py-2">
      {/* Logo */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a2e05] text-[#7cb518] text-xs font-bold mb-3 mt-1 select-none">
        OS
      </div>

      {/* Main nav icons */}
      <nav className="flex flex-col items-center gap-0.5 flex-1">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive =
            activeSection === section.id ||
            location.pathname.startsWith(section.slug);

          return (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => !section.disabled && onSectionClick(section.id)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-zinc-700 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    section.disabled && "opacity-50 cursor-default"
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-white text-xs">
                {section.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-0.5 mt-auto pb-2">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-700 hover:bg-sidebar-accent transition-colors opacity-50 cursor-default"
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-white text-xs">
                {item.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="flex items-center justify-center w-8 h-8 rounded-md text-zinc-700 hover:bg-sidebar-accent transition-colors opacity-50 cursor-default">
              <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-white text-xs">
            Settings
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// --- SUB SIDEBAR (right panel with page links) ---
function SubSidebar({ section }) {
  const location = useLocation();

  if (!section || !section.subPages) return null;

  return (
    <div className="flex flex-col w-[200px] min-w-[200px] border-r border-[#E5E5E5] bg-white h-full">
      {/* Section title */}
      <div className="px-4 pt-5 pb-2">
        <h2 className="text-lg font-semibold font-inter leading-[1.333] tracking-[-0.4px] text-foreground">
          {section.name}
        </h2>
      </div>

      {/* Sub-page links */}
      <nav className="flex flex-col px-2 gap-0.5 flex-1">
        {section.subPages.map((page) => {
          const isActive = location.pathname === page.path;
          return (
            <Link
              key={page.path}
              to={page.disabled ? "#" : page.path}
              className={cn(
                "flex items-center px-3 py-1.5 rounded-md text-sm font-inter transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                page.disabled && "opacity-50 cursor-default pointer-events-none"
              )}
            >
              {page.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings section */}
      {section.settings && section.settings.length > 0 && (
        <div className="px-2 pb-4 mt-2">
          <button
            className="flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm font-inter text-sidebar-foreground hover:bg-sidebar-accent transition-colors opacity-50 cursor-default"
          >
            <span>Settings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- COMBINED SIDEBAR ---
export default function Sidebar() {
  const location = useLocation();

  // Determine active section from current path
  const getActiveSection = () => {
    for (const section of SECTIONS) {
      if (section.subPages) {
        for (const page of section.subPages) {
          if (location.pathname === page.path) return section.id;
        }
      }
      if (location.pathname.startsWith(section.slug) && !section.disabled) {
        return section.id;
      }
    }
    // Default: determine from path
    if (location.pathname.startsWith("/leads") || location.pathname.startsWith("/members")) {
      return "audience";
    }
    if (location.pathname.startsWith("/content-library")) {
      return "videos";
    }
    return "audience";
  };

  const activeSectionId = getActiveSection();
  const activeSection = SECTIONS.find((s) => s.id === activeSectionId);

  const handleSectionClick = (sectionId) => {
    // Navigation is handled by the sub-sidebar links
    // This just updates the active section visually
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (section && section.subPages && section.subPages.length > 0) {
      const firstEnabled = section.subPages.find((p) => !p.disabled);
      if (firstEnabled) {
        window.location.href = firstEnabled.path;
      }
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full">
        <IconSidebar
          activeSection={activeSectionId}
          onSectionClick={handleSectionClick}
        />
        <SubSidebar section={activeSection} />
      </div>
    </TooltipProvider>
  );
}
