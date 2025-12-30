import { useEffect, useState } from "react";
import { api } from "../api";

function Card({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        api("/admin/api/stats"),
        api("/admin/api/orders/latest"),
      ]);
      setStats(s);
      setLatest(l);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Vue d’ensemble du shop.
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500">Chargement…</div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card label="Produits actifs" value={stats ? stats.active_products : "—"} />
        <Card label="Commandes pending" value={stats ? stats.pending_orders : "—"} />
        <Card label="Commandes aujourd’hui" value={stats ? stats.orders_today : "—"} />
        <Card label="Total" value={stats ? `${stats.total_revenue} TND` : "—"} />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="px-4 py-3 border-b">
          <div className="font-semibold text-gray-900">Dernières commandes</div>
          <div className="text-sm text-gray-500">Top 10</div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.id}</div>
                </td>
                <td className="px-4 py-3">{o.phone}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">{o.total}</td>
                <td className="px-4 py-3">
                  {new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {latest.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  Aucune commande pour l’instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
