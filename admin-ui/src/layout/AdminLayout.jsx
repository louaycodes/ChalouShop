import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { getAdminKey, setAdminKey } from "../api";

export default function AdminLayout() {
  const [key, setKey] = useState(getAdminKey());

  useEffect(() => {
    setAdminKey(key);
  }, [key]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="font-semibold text-gray-800">Admin</div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Admin key</span>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="x-admin-key"
                className="w-64 max-w-[60vw] rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
