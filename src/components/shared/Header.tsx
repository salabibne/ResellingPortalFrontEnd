import { useAuthStore } from "@/store/useAuthStore";
import { Bell, User, Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="navbar bg-base-100 shadow-sm border-b border-base-200 px-3 sm:px-6 h-16 min-h-[4rem]">
      {/* Mobile Sidebar Hamburger Toggle */}
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-sm btn-square rounded-xl lg:hidden mr-2 text-base-content"
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
        >
          <Menu size={20} />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold truncate text-base-content">
          Welcome, {user?.name || "Admin"}
        </p>
      </div>
      <div className="flex-none flex items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square rounded-xl"
          aria-label="Notifications"
        >
          <div className="indicator">
            <Bell size={18} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            aria-label="Account menu"
            className="btn btn-ghost btn-sm btn-square rounded-xl avatar placeholder"
          >
            <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
              <span>
                <User size={18} />
              </span>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[50] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
          >
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Settings</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
