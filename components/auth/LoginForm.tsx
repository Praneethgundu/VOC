"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data =
      await response.json();

    if (data.success) {
      router.push("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-4"
    >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(
            e.target.value
          )
        }
        className="border p-3 w-full rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
        className="border p-3 w-full rounded"
      />

      <button
        type="submit"
        className="bg-red-900 text-white p-3 w-full rounded"
      >
        Login
      </button>
    </form>
  );
}