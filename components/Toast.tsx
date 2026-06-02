interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        message
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-gold/30 bg-[#13110d]/95 px-4 py-2.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-mono text-xs tracking-wide text-paper/90">
          {message ?? ""}
        </span>
      </div>
    </div>
  );
}
