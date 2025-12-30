import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await api("/store/products");
      setItems(data);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Paiement à la livraison • Confirmation par appel
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Produits
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Choisis un produit, laisse tes infos, et on s’occupe du reste.
            </p>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {err}
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
                <div className="h-5 w-24 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card p-6 text-sm text-slate-600">
          Aucun produit actif.
        </div>
      )}
    </div>
  );
}
