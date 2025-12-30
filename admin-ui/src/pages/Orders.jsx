import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Modal from "../components/Modal";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const statuses = ["pending", "confirmed", "delivered", "cancelled"];

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");

  const availableStatuses = useMemo(() => {
    const set = new Set();
    for (const o of items) {
      if (o?.status) set.add(o.status);
    }
    // On garde un ordre connu si possible, sinon ordre alpha
    const known = statuses.filter((s) => set.has(s));
    const unknown = Array.from(set)
      .filter((s) => !statuses.includes(s))
      .sort();
    return [...known, ...unknown];
  }, [items]);

  const countsByStatus = useMemo(() => {
    const m = new Map();
    for (const o of items) {
      const st = o?.status || "unknown";
      m.set(st, (m.get(st) || 0) + 1);
    }
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((o) => {
      const matchesText =
        !s ||
        (o.customer_name || "").toLowerCase().includes(s) ||
        (o.phone || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "all" || (o.status || "") === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [items, q, statusFilter]);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await api("/admin/api/orders");
      setItems(data);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setStatus(orderId, status) {
    try {
      await api(`/admin/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await refresh();
      // si modal ouvert sur cette commande, refresh aussi le détail
      if (open && selectedId === orderId) await loadDetail(orderId);
    } catch (e) {
      setErr(String(e));
    }
  }

  async function loadDetail(orderId) {
    setDetailErr("");
    setDetailLoading(true);
    try {
      const d = await api(`/admin/api/orders/${orderId}`);
      setDetail(d);
    } catch (e) {
      setDetailErr(String(e));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function openDetail(orderId) {
    setSelectedId(orderId);
    setOpen(true);
    await loadDetail(orderId);
  }

  function closeDetail() {
    setOpen(false);
    setSelectedId("");
    setDetail(null);
    setDetailErr("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <div className="text-sm text-gray-500">
            Suivi des commandes + changement de statut + détails.
          </div>
        </div>

        <button
          onClick={refresh}
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

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom / téléphone)..."
            className="w-full md:w-96 rounded-xl border bg-white px-3 py-2 text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-56 rounded-xl border bg-white px-3 py-2 text-sm"
            title="Filtrer par statut"
          >
            <option value="all">Tous ({items.length})</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s} ({countsByStatus.get(s) || 0})
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="text-sm text-gray-500">Chargement…</div>}
        <div className="text-sm text-gray-500">
          {filtered.length} / {items.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => openDetail(o.id)}
                title="Clique pour voir le détail"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.id}</div>
                </td>

                <td className="px-4 py-3">{o.phone}</td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${
                      statusStyles[o.status] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>

                <td className="px-4 py-3">{o.total}</td>
                <td className="px-4 py-3">{new Date(o.created_at).toLocaleString()}</td>

                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className="rounded-xl border bg-white px-3 py-2 text-xs"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                  Aucune commande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Détail commande" onClose={closeDetail}>
        {detailLoading && <div className="text-sm text-gray-500">Chargement…</div>}

        {detailErr && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {detailErr}
          </div>
        )}

        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-white p-3">
                <div className="text-xs text-gray-500">Client</div>
                <div className="font-semibold text-gray-900">{detail.order.customer_name}</div>
                <div className="text-sm text-gray-700">{detail.order.phone}</div>
              </div>

              <div className="rounded-xl border bg-white p-3">
                <div className="text-xs text-gray-500">Statut</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${
                      statusStyles[detail.order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {detail.order.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(detail.order.created_at).toLocaleString()}
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl border bg-white p-3">
                <div className="text-xs text-gray-500">Adresse</div>
                <div className="text-sm text-gray-900">{detail.order.address || "—"}</div>
                {detail.order.note && (
                  <>
                    <div className="mt-2 text-xs text-gray-500">Note</div>
                    <div className="text-sm text-gray-900">{detail.order.note}</div>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Produit</th>
                    <th className="px-3 py-2 text-right">Qté</th>
                    <th className="px-3 py-2 text-right">PU</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{it.product_name}</div>
                        <div className="text-xs text-gray-500">{it.product_id}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">{it.unit_price}</td>
                      <td className="px-3 py-2 text-right">{Number(it.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td className="px-3 py-2 font-semibold" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right font-bold">{detail.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeDetail}
                className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
