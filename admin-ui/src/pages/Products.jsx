import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { api } from "../api";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  image_url: "",
  is_active: true,
};

function toForm(p) {
  return {
    id: p.id,
    name: p.name ?? "",
    description: p.description ?? "",
    price: String(p.price ?? ""),
    image_url: p.image_url ?? "",
    is_active: Boolean(p.is_active),
  };
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const p of items) {
      if (p?.is_active) active += 1;
      else inactive += 1;
    }
    return { active, inactive, total: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesText = !s || (p.name || "").toLowerCase().includes(s);

      const isActive = Boolean(p?.is_active);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesText && matchesStatus;
    });
  }, [items, q, statusFilter]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(form.id);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const data = await api("/admin/api/products");
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

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p) {
    setForm(toForm(p));
    setOpen(true);
  }

  async function save() {
    setErr("");
    const name = form.name.trim();
    const priceNum = Number(form.price);

    if (!name) return alert("Nom obligatoire");
    if (form.price === "" || Number.isNaN(priceNum)) return alert("Prix invalide");

    const payload = {
      name,
      description: form.description.trim() || null,
      price: priceNum,
      image_url: form.image_url.trim() || null,
      is_active: Boolean(form.is_active),
    };

    try {
      if (isEdit) {
        await api(`/admin/api/products/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/admin/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setOpen(false);
      await refresh();
    } catch (e) {
      setErr(String(e));
    }
  }

  async function deactivate(p) {
    if (!confirm(`Désactiver "${p.name}" ?`)) return;
    try {
      await api(`/admin/api/products/${p.id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setErr(String(e));
    }
  }

  async function activate(p) {
  try {
    await api(`/admin/api/products/${p.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: true }),
    });
    await refresh();
  } catch (e) {
    setErr(String(e));
  }
}


  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <div className="text-sm text-gray-500">
            Ajouter, modifier et désactiver tes produits.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            🔄 Rafraîchir
          </button>
          <button
            onClick={openCreate}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            ➕ Nouveau produit
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full md:w-80 rounded-xl border bg-white px-3 py-2 text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 rounded-xl border bg-white px-3 py-2 text-sm"
            title="Filtrer par statut"
          >
            <option value="all">Tous ({counts.total})</option>
            <option value="active">Actif ({counts.active})</option>
            <option value="inactive">Inactif ({counts.inactive})</option>
          </select>

          <span className="text-sm text-gray-500 self-center">
            {filtered.length} / {items.length}
          </span>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Chargement…</div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Actif</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.id}</div>
                </td>
                <td className="px-4 py-3">{p.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      p.is_active
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {p.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
<div className="flex justify-end gap-2">
  <button
    onClick={() => openEdit(p)}
    className="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-gray-50"
  >
    ✏️ Modifier
  </button>

  {p.is_active ? (
    <button
      onClick={() => deactivate(p)}
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100"
    >
      🗑️ Désactiver
    </button>
  ) : (
    <button
      onClick={() => activate(p)}
      className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 hover:bg-green-100"
    >
      ✅ Réactiver
    </button>
  )}
</div>

                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                  Aucun produit trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={isEdit ? "Modifier un produit" : "Ajouter un produit"}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="Pack..."
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Prix</label>
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="49.90"
                inputMode="decimal"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Statut</label>
              <select
                value={String(form.is_active)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.value === "true" }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="https://..."
              />
              <div className="mt-1 text-xs text-gray-500">
                Optionnel. On validera l’URL plus tard.
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                rows={4}
                placeholder="Détails du produit..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={save}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {isEdit ? "Sauvegarder" : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
