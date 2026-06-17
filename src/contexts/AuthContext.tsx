import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Bug #2 — Session drop fix:
    // Only mutate state on meaningful auth events. TOKEN_REFRESHED and
    // USER_UPDATED fire frequently on mobile (especially after the tab is
    // backgrounded or the network reconnects). Toggling `loading` on every
    // event caused the UI to remount and looked like an involuntary logout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        if (import.meta.env.DEV) console.debug('[auth] event:', event);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          return;
        }

        // SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED / USER_UPDATED /
        // PASSWORD_RECOVERY — keep state in sync but never flip loading
        // back to true (initial load handles that once).
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // Initial session hydration
    supabase.auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      })
      .catch((err) => {
        console.error('[auth] getSession failed:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Bug #2 — Reconnect handler: when the device comes back online or the
    // tab becomes visible again after a network blip, force a session
    // refresh so the user does not appear "logged out" until the next API
    // call lazily refreshes the token.
    const refresh = () => {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
      }).catch((err) => console.error('[auth] refresh failed:', err));
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      
      let userMessage = "Não foi possível criar a conta. Tente novamente.";
      if (error.message?.includes('already registered')) {
        userMessage = "Este email já está cadastrado.";
      } else if (error.message?.includes('invalid')) {
        userMessage = "Email ou senha inválidos.";
      }
      
      toast({
        title: "Erro ao criar conta",
        description: userMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Você já pode começar a usar o app.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      
      let userMessage = "Email ou senha incorretos.";
      if (error.message?.includes('Invalid')) {
        userMessage = "Email ou senha incorretos.";
      } else if (error.message?.includes('not confirmed')) {
        userMessage = "Confirme seu email antes de fazer login.";
      }
      
      toast({
        title: "Erro ao fazer login",
        description: userMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email de recuperação. Verifique o endereço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
