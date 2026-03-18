export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return <p className="state state-loading">{message}</p>;
}
