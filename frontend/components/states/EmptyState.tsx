export default function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="state state-empty">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
