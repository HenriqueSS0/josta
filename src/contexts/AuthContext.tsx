import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; isAdmin: boolean }>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; isAdmin: boolean }> => {
    try {
      // Verificar se é uma conta de teste
      if (email === 'admin@test.com' && password === '123456') {
        // Simular login do admin
        const mockUser = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'admin@test.com',
          user_metadata: { full_name: 'Administrador Teste' }
        } as User;
        
        const mockProfile = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'admin@test.com',
          full_name: 'Administrador Teste',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Profile;

        setUser(mockUser);
        setProfile(mockProfile);
        toast.success('Login realizado com sucesso! Bem-vindo ao painel administrativo.');
        return { success: true, isAdmin: true };
      }

      if (email === 'cliente@test.com' && password === '123456') {
        // Simular login do cliente
        const mockUser = {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'cliente@test.com',
          user_metadata: { full_name: 'Cliente Teste' }
        } as User;
        
        const mockProfile = {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'cliente@test.com',
          full_name: 'Cliente Teste',
          role: 'customer' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Profile;

        setUser(mockUser);
        setProfile(mockProfile);
        toast.success('Login realizado com sucesso! Bem-vindo à loja!');
        return { success: true, isAdmin: false };
      }

      // Login normal via Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Buscar perfil para verificar se é admin
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.session.user.id)
          .single();
        
        const isAdmin = profileData?.role === 'admin' || profileData?.role === 'moderator';
        
        toast.success(`Login realizado com sucesso! ${isAdmin ? 'Bem-vindo ao painel administrativo.' : 'Bem-vindo à loja!'}`);
        return { success: true, isAdmin };
      }
      
      return { success: true, isAdmin: false };
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      return { success: false, isAdmin: false };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Conta criada com sucesso!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      
      await fetchProfile(user.id);
      toast.success('Perfil atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      return false;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};