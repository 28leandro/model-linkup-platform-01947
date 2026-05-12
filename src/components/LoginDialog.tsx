import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"
import { useLanguage } from "@/contexts/LanguageContext"
import { Eye, EyeOff, KeyRound } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const MAX_ATTEMPTS = 3
  const isLogin = mode === "login"
  const isSignup = mode === "signup"
  const isRecovery = mode === "recovery"
  const showForgot = isLogin && failedAttempts > 0
  const lockedOut = isLogin && failedAttempts >= MAX_ATTEMPTS

  const loginSchema = z.object({
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin'))
  });

  const signupSchema = z.object({
    name: z.string().min(2, t('login.nameTooShort')),
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin')),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t('login.passwordMismatch'),
    path: ["confirmPassword"]
  });

  const recoverySchema = z.object({
    email: z.string().email(t('login.invalidEmail')),
  });

  const resetState = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFailedAttempts(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (isRecovery) {
      const result = recoverySchema.safeParse({ email });
      if (!result.success) {
        setErrors({ email: result.error.issues[0]?.message ?? "" });
        return;
      }
      setSubmitting(true)
      const { error } = await resetPassword(email);
      setSubmitting(false)
      if (!error) {
        resetState()
        setMode("login")
      }
      return;
    }

    if (isLogin) {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setSubmitting(true)
      const { error } = await signIn(email, password);
      setSubmitting(false)
      if (!error) {
        resetState()
        onOpenChange(false);
      } else {
        const next = failedAttempts + 1
        setFailedAttempts(next)
        const remaining = Math.max(MAX_ATTEMPTS - next, 0)
        setErrors({
          password: remaining > 0
            ? t('login.attemptsRemaining').replace('{n}', String(remaining))
            : t('login.lockedOut'),
        })
      }
    } else {
      const result = signupSchema.safeParse({ name, email, password, confirmPassword });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setSubmitting(true)
      const { error } = await signUp(email, password, name);
      setSubmitting(false)
      if (!error) {
        resetState()
        onOpenChange(false);
      }
    }
  }

  const handleModeChange = (newMode: "login" | "signup" | "recovery") => {
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    if (newMode !== "login") setFailedAttempts(0)
    setMode(newMode)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetState(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isRecovery ? t('login.recoveryTitle') : isLogin ? t('login.title') : t('login.signupTitle')}
            </DialogTitle>
            <DialogDescription>
              {isRecovery
                ? t('login.recoveryDescription')
                : isLogin ? t('login.description') : t('login.signupDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="name">{t('login.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('login.namePlaceholder')}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            {!isRecovery && (
              <div className="grid gap-2">
                <Label htmlFor="password">{t('login.password')}</Label>
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
            )}
            {isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('login.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-11 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? t('login.hidePassword') : t('login.showPassword')}
                    className="absolute inset-y-0 right-0 flex h-full w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}
            {showForgot && (
              <button
                type="button"
                onClick={() => handleModeChange("recovery")}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  lockedOut
                    ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                {t('login.forgotPassword')}
              </button>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {isRecovery
                ? t('login.recoverySubmit')
                : isLogin ? t('login.submit') : t('login.signupSubmit')}
            </Button>
            {isRecovery ? (
              <Button
                type="button"
                variant="link"
                className="w-full text-[#0EA5E9] hover:text-[#0EA5E9]/80"
                onClick={() => handleModeChange("login")}
              >
                {t('login.backToLogin')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="link"
                className="w-full text-[#0EA5E9] hover:text-[#0EA5E9]/80"
                onClick={() => handleModeChange(isLogin ? "signup" : "login")}
              >
                {isLogin ? t('login.switchToSignup') : t('login.switchToLogin')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
