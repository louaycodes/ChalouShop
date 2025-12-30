import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <Link
      to={`/p/${p.id}`}
      className="group card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400">
            Pas d’image
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 group-hover:text-indigo-700 line-clamp-1">
          {p.name}
        </div>
            <div className="mt-1 text-sm text-slate-600 line-clamp-2">
          {p.description || "—"}
        </div>
          </div>

          <div className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-extrabold text-indigo-700">
            {p.price} TND
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
          Voir le produit
          <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}
