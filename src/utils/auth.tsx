'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Ensure user exists in users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: session.user.id, email: session.user.email! }]);

          if (insertError) {
            console.error('Error inserting user:', insertError);
          }
        }
      }

      setUser(session?.user || null);
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user && _event === 'SIGNED_IN') {
            // Ensure user exists in users table
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single();

            if (!existingUser) {
              const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: session.user.id, email: session.user.email! }]);

              if (insertError) {
                console.error('Error inserting user:', insertError);
              }
            }
          }

          setUser(session?.user || null);
          setLoading(false);
          if (_event === 'SIGNED_OUT') {
            router.push('/');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    getInitialSession();
  }, [router]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    // Insert user into users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email: data.user.email! }]);

      if (insertError) {
        console.error('Error inserting user:', insertError);
        // Don't throw here, as auth succeeded
      }
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}