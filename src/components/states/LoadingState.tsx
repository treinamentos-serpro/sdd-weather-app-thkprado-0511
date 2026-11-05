interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Carregando previsão do tempo...',
}: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-8 text-slate-200">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-accent-400 border-t-transparent"
      />
      <span>{message}</span>
    </div>
  );
}
