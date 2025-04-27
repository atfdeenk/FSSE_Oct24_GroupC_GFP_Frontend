import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (token: string) => void;
  error?: string;
}

export default function LoginForm({ onLogin, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    let lastError = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        let data: any = {};
        try {
          data = await res.json();
        } catch (e) {
          // ignore JSON parse error
        }
        if (res.ok && data.access_token) {
          onLogin(data.access_token);
          setLoading(false);
          return;
        } else {
          lastError = data && data.message ? data.message : "Login failed. Please check your credentials.";
        }
      } catch (err: any) {
        lastError = "Network error. Please check your connection or try again later.";
      }
      // Wait 500ms before retrying
      if (attempt < 3) await new Promise(res => setTimeout(res, 500));
    }
    setFormError(lastError);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      {(formError || error) && <div className="text-red-600 mb-2 text-center">{formError || error}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="border rounded px-3 py-2 w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            className="border rounded px-3 py-2 w-full pr-20"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded hover:bg-green-200"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
