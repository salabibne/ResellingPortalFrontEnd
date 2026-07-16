import { useAuthStore } from "@/store/useAuthStore";
import { Bell, User } from "lucide-react";

export default function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="navbar bg-base-500 shadow-sm border-b border-base-200 px-6">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">Welcome, {user?.name || "Admin"}</h1>
      </div>
      <div className="flex-none gap-4">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <Bell size={20} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span className="text-lg"><User size={20} /></span>
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-500 rounded-box w-52">
            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
