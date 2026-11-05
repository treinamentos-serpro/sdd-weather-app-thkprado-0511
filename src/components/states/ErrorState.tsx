interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-950/30 p-5">
      <h2 className="font-semibold text-red-100">Não foi possível carregar os dados</h2>
      <p className="mt-2 text-sm text-red-100/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-accent-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}
