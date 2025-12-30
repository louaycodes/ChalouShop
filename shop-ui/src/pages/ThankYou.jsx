import { Link, useSearchParams } from "react-router-dom";

export default function ThankYou() {
  const [sp] = useSearchParams();
  const orderId = sp.get("order_id");

  return (
    <div className="mx-auto max-w-xl space-y-5 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
        <span className="text-3xl">✓</span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Commande reçue
        </h1>
        <p className="mt-2 text-slate-600">
          Merci. On va t’appeler pour confirmer la commande.
        </p>
      </div>

      {orderId && (
        <div className="card p-5 text-left">
          <div className="text-xs font-semibold text-slate-500">Référence</div>
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm break-all text-slate-800">
            {orderId}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Link
          to="/"
          className="btn btn-primary"
        >
          Retour aux produits
        </Link>
      </div>

      <div className="text-xs text-slate-500">
        Paiement à la livraison • Tunis / Tunisie
      </div>
    </div>
  );
}
