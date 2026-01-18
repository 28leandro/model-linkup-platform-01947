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

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
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
      
      const { error } = await signIn(email, password);
      if (!error) {
        onOpenChange(false);
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
      
      const { error } = await signUp(email, password, name);
      if (!error) {
        onOpenChange(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isLogin ? t('login.title') : t('login.signupTitle')}</DialogTitle>
            <DialogDescription>
              {isLogin ? t('login.description') : t('login.signupDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isLogin && (
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
            <div className="grid gap-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('login.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              {isLogin ? t('login.submit') : t('login.signupSubmit')}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-[#0EA5E9] hover:text-[#0EA5E9]/80"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? t('login.switchToSignup')
                : t('login.switchToLogin')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
