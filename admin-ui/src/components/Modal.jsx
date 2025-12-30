export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="text-lg font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
