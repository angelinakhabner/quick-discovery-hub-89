import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        if (rememberMe) {
          localStorage.setItem("whatson_remember", email);
        } else {
          localStorage.removeItem("whatson_remember");
        }
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for a verification link.",
        });
      }
    }
    setLoading(false);
  };

  useState(() => {
    const remembered = localStorage.getItem("whatson_remember");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  });

  const inputClass = "w-full px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif-display text-4xl italic text-foreground tracking-tight">
            Whatsön
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {isLogin && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border text-foreground focus:ring-ring accent-foreground"
              />
              <span className="text-[10px] font-heading text-muted-foreground tracking-wide">Remember me</span>
            </label>
          )}

          {message && (
            <p className={`text-xs font-heading tracking-wide ${message.type === "error" ? "text-destructive" : "text-foreground/70"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-heading font-medium tracking-wide uppercase rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground font-heading mt-8 tracking-wide">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
            className="text-foreground hover:underline underline-offset-4"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
