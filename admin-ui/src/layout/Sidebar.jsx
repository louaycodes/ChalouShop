import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";
const linkInactive = "text-gray-700 hover:bg-gray-100";
const linkActive = "bg-indigo-600 text-white";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold">ChalouShop</div>
        <div className="text-xs text-gray-500">Backoffice</div>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          🧾 Produits
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          📦 Commandes
        </NavLink>
      </nav>

      <div className="mt-auto p-4 border-t text-xs text-gray-500">
        v0.1 • dev
      </div>
    </aside>
  );
}
