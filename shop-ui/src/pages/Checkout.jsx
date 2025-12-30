import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../api";

export default function Checkout() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const productId = sp.get("product_id");
  const qtyFromUrl = Number(sp.get("qty") || "1");
  const clampQty = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 1;
    return Math.min(99, Math.max(1, Math.floor(x)));
  };

  const [qty, setQty] = useState(() => clampQty(qtyFromUrl));

  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const items = await api("/store/products");
        const found = items.find((x) => x.id === productId);
        setP(found || null);
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, [productId]);

  // Sync URL -> state
  useEffect(() => {
    setQty(clampQty(qtyFromUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qtyFromUrl]);

  // Sync state -> URL (keeps refresh/back/share working)
  useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("qty", String(qty));
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty]);

  async function submit() {
    setErr("");
    if (!productId) return setErr("Produit manquant.");
    const safeQty = clampQty(qty);
    if (safeQty !== qty) setQty(safeQty);
    if (!form.customer_name.trim()) return setErr("Nom obligatoire.");
    if (!form.phone.trim()) return setErr("Téléphone obligatoire.");
    if (!form.address.trim()) return setErr("Adresse obligatoire.");

    setSending(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim() || null,
        items: [{ product_id: productId, quantity: safeQty }],
      };

      const created = await api("/store/orders", {
  method: "POST",
  body: JSON.stringify(payload),
});

nav(`/thank-you?order_id=${encodeURIComponent(created.order_id || "")}`);

    } catch (e) {
      setErr(String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="btn btn-ghost w-fit">← Retour</Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Finaliser la commande</h1>
        <p className="mt-2 text-slate-600">Remplis ces infos et on te rappelle pour confirmer.</p>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {err}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">Récap</div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{qty}×</div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-600">Quantité</div>
            <div className="mt-2 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                className="btn btn-ghost h-10 w-10 px-0"
                onClick={() => setQty((x) => clampQty(x - 1))}
                aria-label="Diminuer la quantité"
              >
                −
              </button>

              <input
                className="h-10 w-16 bg-transparent text-center text-sm font-bold text-slate-900 focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                onBlur={() => setQty((x) => clampQty(x))}
                aria-label="Quantité"
              />

              <button
                type="button"
                className="btn btn-ghost h-10 w-10 px-0"
                onClick={() => setQty((x) => clampQty(x + 1))}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500">Min 1 • Max 99</div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div>
              Produit: <span className="font-medium text-slate-900">{p?.name || productId}</span>
            </div>
            <div>
              Prix total: <span className="font-extrabold text-slate-900">{p ? `${(Number(p.price) * qty).toFixed(2)} TND` : "—"}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Paiement à la livraison • Confirmation par appel.
          </div>
        </div>

        <div className="card p-5">
          <div className="font-semibold text-slate-900">Tes informations</div>
          <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nom complet</label>
            <input
              className="input"
              value={form.customer_name}
              onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Téléphone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+216..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Adresse</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Ville, rue..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Note (optionnel)</label>
            <textarea
              className="input"
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Heure d’appel, étage..."
            />
          </div>

          <button
            onClick={submit}
            disabled={sending}
            className="btn btn-primary w-full py-3"
          >
            {sending ? "Envoi..." : "Confirmer la commande"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
