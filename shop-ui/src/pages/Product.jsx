import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();

  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      // on récupère la liste et on filtre (simple MVP)
      const items = await api("/store/products");
      const found = items.find((x) => x.id === id);
      if (!found) throw new Error("Produit introuvable (ou inactif).");
      setP(found);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="text-sm text-slate-500">Chargement…</div>;
  if (err) return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>
      <Link to="/" className="btn btn-ghost w-fit">← Retour</Link>
    </div>
  );
  if (!p) return null;

  return (
    <div className="space-y-6">
      <Link to="/" className="btn btn-ghost w-fit">← Retour</Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden bg-slate-100 aspect-[4/3]">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400">Pas d’image</div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{p.name}</h1>
            <div className="mt-2 text-slate-700">{p.description || "—"}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-3xl font-extrabold text-slate-900">{p.price} <span className="text-lg font-bold text-slate-500">TND</span></div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Paiement à la livraison
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => nav(`/checkout?product_id=${encodeURIComponent(p.id)}&qty=1`)}
              className="btn btn-primary w-full sm:w-auto px-6 py-3"
            >
              Commander maintenant
            </button>
            <Link
              to="/"
              className="btn btn-ghost w-full sm:w-auto px-6 py-3"
            >
              Continuer mes achats
            </Link>
          </div>

          <div className="text-xs text-slate-500">
            On t’appelle pour confirmer la commande.
          </div>
        </div>
      </div>
    </div>
  );
}
