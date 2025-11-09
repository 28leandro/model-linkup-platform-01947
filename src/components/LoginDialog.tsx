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

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        onOpenChange(false);
      }
    } else {
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
            <DialogTitle>{isLogin ? "Connexion" : "Inscription"}</DialogTitle>
            <DialogDescription>
              {isLogin ? "Connectez-vous à votre compte Neo.fr" : "Créez votre compte Neo.fr"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              {isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-[#0EA5E9] hover:text-[#0EA5E9]/80"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
