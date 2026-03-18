"use client";

import { useState } from "react";

type Props = {
  title: string;
  submitLabel: string;
  onSubmit: (username: string, password: string) => Promise<void>;
};

export default function AuthForm({ title, submitLabel, onSubmit }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main>
      <h1>{title}</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await onSubmit(username, password);
            setMessage("Success");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unexpected error");
          }
        }}
      >
        <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{submitLabel}</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
