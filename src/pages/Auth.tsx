"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";

type BackendUser = { email: string | null; name?: string; picture?: string };

export default function AuthPage(): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dashboardUrl = `${window.location.origin}/dashboard`;

  // ✅ Google sign-in (redirects to Dashboard)
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "${window.location.origin}/dashboard" },
    });
    if (error) setError(error.message);
    if (data?.url) window.location.href = data.url;
    setLoading(false);
  };

  // ✅ Email/password sign-in
  const signInWithEmail = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/dashboard");
    setLoading(false);
  };

  // ✅ Email/password sign-up (with user existence check)
  const signUpWithEmail = async () => {
    if (!name) {
      setError("Please enter your name");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔍 Check if user already exists
      const { data: existingUsers, error: existingError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email);

      if (existingError) throw existingError;

      if (existingUsers && existingUsers.length > 0) {
        setError("User already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

      // 🧠 Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: dashboardUrl,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // 🧾 Save user in backend
      try {
        const payload: BackendUser = { email, name, picture: "" };
        await fetch("https://acquire-underwriting1.onrender.com/save_user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // ignore network errors in dev
      }

      // 🎯 Redirect or show confirmation message
      if (data?.session) navigate("/dashboard");
      else setError("Check your inbox to confirm your email.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <img
            src="/lovable-uploads/thumbnail_6EF3FB90-6A8A-4B64-A2A6-69D9386F87AF.png"
            alt="logo"
            width={220}
            height={120}
          />
        </div>
        <h2 className="text-2xl font-bold mt-4">Welcome to Acquire Underwriting</h2>
        <p className="text-gray-600 mt-2">Sign in or sign up to continue</p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* 🧑 Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />

        {/* 🔐 Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />

        {/* 🔑 Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />

        {/* 🧭 Sign In */}
        <Button variant="default" onClick={signInWithEmail} className="w-full" disabled={loading}>
          {loading ? "Please wait..." : "Sign In"}
        </Button>

        <div className="text-center text-gray-500">or</div>

        {/* 🌐 Google Sign In */}
        <Button variant="outline" onClick={signInWithGoogle} className="w-full" disabled={loading}>
          Continue with Google
        </Button>

        <div className="text-center text-gray-500">or</div>

        {/* 🧾 Sign Up */}
        <Button variant="secondary" onClick={signUpWithEmail} className="w-full" disabled={loading}>
          {loading ? "Please wait..." : "Sign Up"}
        </Button>
      </div>
    </div>
  );
}
