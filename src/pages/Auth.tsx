import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
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
          text: "Check your email for a verification link to complete your sign up.",
        });
      }
    }
    setLoading(false);
  };

  // Load remembered email on mount
  useState(() => {
    const remembered = localStorage.getItem("whatson_remember");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Sparkles size={24} className="text-primary" />
          <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
            Whatsön
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-heading font-medium text-muted-foreground mb-1">
                Nazwa wyświetlana
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Twoje imię"
                className="w-full px-4 py-2.5 text-sm bg-card text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-heading font-medium text-muted-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 text-sm bg-card text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-heading font-medium text-muted-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm bg-card text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Remember me */}
          {isLogin && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
              />
              <span className="text-xs font-heading text-muted-foreground">Zapamiętaj mnie</span>
            </label>
          )}

          {message && (
            <p className={`text-sm font-heading ${message.type === "error" ? "text-destructive" : "text-primary"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-heading font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "…" : isLogin ? "Zaloguj się" : "Utwórz konto"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-heading mt-6">
          {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
