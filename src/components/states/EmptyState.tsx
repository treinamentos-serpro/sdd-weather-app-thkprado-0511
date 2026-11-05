interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  message = 'Confira o nome digitado e tente buscar novamente.',
}: EmptyStateProps) {
  return (
    <div role="status" className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-slate-300">{message}</p>
    </div>
  );
}
