"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button, Input, Label } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const store = useStore();

  // Expose open/close via global event
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__openAuthModal = () => setOpen(true);
  }

  const registerMutation = trpc.storefront.registerCustomer.useMutation({
    onSuccess: async () => {
      // Auto login after registration
      const result = await signIn("credentials", {
        email,
        password,
        storeId: store.id,
        redirect: false,
      });
      if (result?.error) {
        setError("Registration succeeded but auto-login failed. Please log in.");
      } else {
        setOpen(false);
        resetForm();
      }
    },
    onError: (err) => setError(err.message),
  });

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      storeId: store.id,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      setOpen(false);
      resetForm();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    registerMutation.mutate({
      storeSlug: store.slug,
      email,
      password,
      firstName,
      lastName,
    });
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={() => { setOpen(false); resetForm(); }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-background rounded-xl shadow-2xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold">
              {mode === "login" ? "Log In" : "Create Account"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => { setOpen(false); resetForm(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="auth-firstName">First Name</Label>
                  <Input
                    id="auth-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="auth-lastName">Last Name</Label>
                  <Input
                    id="auth-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full rounded-full h-11 font-semibold"
              disabled={loading || registerMutation.isPending}
            >
              {loading || registerMutation.isPending
                ? "Please wait..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => { setMode("register"); setError(""); }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}

export function openAuthModal() {
  const fn = (window as unknown as Record<string, unknown>).__openAuthModal as (() => void) | undefined;
  fn?.();
}
