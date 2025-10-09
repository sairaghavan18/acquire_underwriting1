"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
 // if not using Next, replace with <img src="/login.png" />
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


  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: dashboardUrl },
    });
    if (error) setError(error.message);
    // Force provider redirect if url provided (helps some environments)
    if (data?.url) window.location.href = data.url;
    setLoading(false);
  };


  const signInWithEmail = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/dashboard");
    setLoading(false);
  };


  const signUpWithEmail = async () => {
    if (!name) { setError("Please enter your name"); return; }
    setLoading(true);
    setError(null);
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
    // Send minimal profile to backend
    try {
      const payload: BackendUser = { email, name, picture: "" };
      await fetch("https://underwriting-at5l.onrender.com/save_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // ok in local dev
    }
    // If email confirmation is enabled, session is null; Supabase will redirect to /dashboard after email confirmation.
    if (data?.session) navigate("/dashboard");
    else setError("Check your inbox to confirm; after confirming you will be redirected to the dashboard.");
    setLoading(false);
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <img src="/lovable-uploads/32801df0-3105-4879-afde-7c180138cc4a.png" alt="logo" width={220} height={120} />
        </div>
        <h2 className="text-2xl font-bold mt-4">Welcome to Acquire Underwriting</h2>
        <p className="text-gray-600 mt-2">Sign in or sign up to continue</p>
      </div>


      <div className="space-y-4 w-full max-w-sm">
        {error && <p className="text-red-600 text-sm">{error}</p>}


        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-4 py-2"
        />


        <Button onClick={signUpWithEmail} className="w-full" disabled={loading}>
          {loading ? "Please wait..." : "Sign Up with Email"}
        </Button>


        <div className="text-center text-gray-500">or</div>


        <Button variant="outline" onClick={signInWithGoogle} className="w-full" disabled={loading}>
          Continue with Google
        </Button>


        <Button variant="ghost" onClick={signInWithEmail} className="w-full" disabled={loading}>
          Sign In with Email
        </Button>
      </div>
    </div>
  );
}