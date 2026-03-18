export default function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="state state-error">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
