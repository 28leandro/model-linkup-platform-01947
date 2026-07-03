import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().email(t('login.invalidEmail')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (resetError) {
      toast({
        title: t('forgotPassword.errorTitle') || t('resetPassword.errorTitle'),
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    // Remember the email so /reset-password can offer a one-click resend.
    try {
      sessionStorage.setItem('passwordResetEmail', email);
    } catch {
      // ignore storage errors
    }

    setSent(true);
    toast({
      title: t('forgotPassword.successTitle'),
      description: t('forgotPassword.successDesc'),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle>{t('login.recoveryTitle')}</CardTitle>
          <CardDescription>{t('login.recoveryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t('forgotPassword.successDesc')}
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                {t('common.backToHome')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('postAd.loading') : t('login.recoverySubmit')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('login.backToLogin')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
