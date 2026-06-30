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
import {
  cleanPasswordRecoveryUrl,
  clearPasswordRecoveryState,
  getPasswordResetRedirectUrl,
  getRecoveryUrlState,
  getRememberedPasswordResetEmail,
  isPasswordRecoveryActive,
  markPasswordRecoveryActive,
  rememberPasswordResetEmail,
  shouldTreatUrlAsPasswordRecovery,
} from "@/lib/passwordRecovery";

type Status = "verifying" | "ready" | "invalid";

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
      const { code, tokenHash, type, hasHashTokens, hasAuthParams, error } = getRecoveryUrlState();
      const recoveryLink = shouldTreatUrlAsPasswordRecovery();

      if (recoveryLink) markPasswordRecoveryActive();

      if (error) {
        setStatus("invalid");
        return;
      }

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
        } else if (hasHashTokens && (type === "recovery" || recoveryLink)) {
          // The SDK auto-parses the hash and fires PASSWORD_RECOVERY.
          // Wait briefly for the session to materialize.
          await new Promise((r) => setTimeout(r, 800));
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        // Clean the URL so the token isn't kept in history.
        if (hasAuthParams) cleanPasswordRecoveryUrl();
        setStatus(session && (recoveryLink || isPasswordRecoveryActive()) ? "ready" : "invalid");
      } catch (err) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled) {
          if (session && (recoveryLink || isPasswordRecoveryActive())) {
            if (hasAuthParams) cleanPasswordRecoveryUrl();
            setStatus("ready");
          } else {
            setStatus("invalid");
          }
        }
      }
    };

    verify();

    // Catch PASSWORD_RECOVERY events fired after mount (implicit flow).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) {
        markPasswordRecoveryActive();
        cleanPasswordRecoveryUrl();
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
    clearPasswordRecoveryState();
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const handleResend = async () => {
    const email = getRememberedPasswordResetEmail();

    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    setResending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    setResending(false);

    if (error) {
      toast({
        title: t('resetPassword.resendError') || t('resetPassword.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    rememberPasswordResetEmail(email);
    toast({
      title: t('resetPassword.resendSuccess') || t('forgotPassword.successTitle'),
      description: t('resetPassword.resendDesc') || t('forgotPassword.successDesc'),
    });
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
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {t('resetPassword.resendEmail') || t('login.recoverySubmit')}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/forgot-password")} className="w-full">
                {t('login.backToLogin')}
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