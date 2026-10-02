import { useAuthStore } from "@/store/useAuthStore";
import { Bell, User, Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="navbar bg-base-100 shadow-sm border-b border-base-200 px-3 sm:px-6 h-16 min-h-[4rem]">
      {/* Mobile Sidebar Hamburger Toggle */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-square btn-sm lg:hidden mr-2 text-base-content"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-xl font-semibold truncate text-base-content">
          Welcome, {user?.name || "Admin"}
        </h1>
      </div>
      <div className="flex-none gap-2 sm:gap-4">
        <button className="btn btn-ghost btn-circle btn-sm sm:btn-md" aria-label="Notifications">
          <div className="indicator">
            <Bell size={18} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm sm:btn-md avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-8 sm:w-10">
              <span className="text-sm sm:text-lg"><User size={18} /></span>
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[50] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
