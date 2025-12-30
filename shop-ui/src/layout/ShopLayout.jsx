import { Link, Outlet } from "react-router-dom";

export default function ShopLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="container-app flex items-center justify-between py-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ChalouShop"
              className="h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44 object-contain rounded-none"
              loading="eager"
              decoding="async"
            />
            <div className="leading-tight">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">ChalouShop</div>
              <div className="text-xs font-semibold text-slate-500">Boutique • Paiement à la livraison</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link className="btn btn-ghost" to="/">Produits</Link>
          </nav>
        </div>
      </header>

      <main className="container-app py-8">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="container-app py-10">
          <div className="card overflow-hidden">
            <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt=""
                  aria-hidden="true"
                  className="h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44 object-contain rounded-none"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <div className="font-extrabold tracking-tight text-slate-900">Contact</div>
                  <div className="text-sm text-slate-600">Une question ? On te répond vite.</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <a className="btn btn-ghost" href="tel:+21698202263">☎ Appeler</a>
                <a className="btn btn-ghost" href="mailto:louayzorai24@gmail.com">✉ Email</a>
                <a className="btn btn-primary" href="https://wa.me/21698202263" target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
              © {new Date().getFullYear()} ChalouShop • Tunis • Paiement à la livraison
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
