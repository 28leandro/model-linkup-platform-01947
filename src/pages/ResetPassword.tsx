import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type Status = "verifying" | "ready" | "invalid";

const RESET_EMAIL_KEY = "passwordResetEmail";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>("verifying");
  const [resending, setResending] = useState(false);

  // Verify the recovery link on mount.
  // Supabase can deliver the token in three shapes:
  //   1. PKCE:        /reset-password?code=xxxx
  //   2. token_hash:  /reset-password?token_hash=xxxx&type=recovery
  //   3. Implicit:    /reset-password#access_token=xxxx&type=recovery (SDK auto-handles)
  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const hashParams = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
      );
      const hashType = hashParams.get("type");
      const hasHashTokens = hashParams.has("access_token");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) throw error;
        } else if (hasHashTokens && hashType === "recovery") {
          // The SDK auto-parses the hash and fires PASSWORD_RECOVERY.
          // Wait briefly for the session to materialize.
          await new Promise((r) => setTimeout(r, 250));
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        // Clean the URL so the token isn't kept in history.
        window.history.replaceState({}, "", "/reset-password");
        setStatus(session ? "ready" : "invalid");
      } catch (err) {
        if (!cancelled) setStatus("invalid");
      }
    };

    verify();

    // Catch PASSWORD_RECOVERY events fired after mount (implicit flow).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) {
        window.history.replaceState({}, "", "/reset-password");
        setStatus("ready");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const schema = z.object({
    password: z.string().min(6, t('login.passwordMin')),
    confirmPassword: z.string(),
  }).refine(d => d.password === d.confirmPassword, {
    message: t('login.passwordMismatch'),
    path: ["confirmPassword"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast({
        title: t('resetPassword.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('resetPassword.successTitle'),
      description: t('resetPassword.successDesc'),
    });
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle>{t('resetPassword.title')}</CardTitle>
          <CardDescription>{t('resetPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "verifying" ? (
            <p className="text-center text-sm text-muted-foreground">{t('postAd.loading')}</p>
          ) : status === "invalid" ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{t('resetPassword.invalidLink')}</p>
              <Button variant="outline" onClick={() => navigate("/forgot-password")}>
                {t('login.recoverySubmit')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className={`pr-11 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    className="absolute inset-y-0 right-0 flex h-full w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    className={`pr-11 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? t('login.hidePassword') : t('login.showPassword')}
                    className="absolute inset-y-0 right-0 flex h-full w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('postAd.loading') : t('resetPassword.submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}