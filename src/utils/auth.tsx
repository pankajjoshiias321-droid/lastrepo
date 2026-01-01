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
    let mounted = true;

    // Get the initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('Session retrieved:', session ? 'authenticated' : 'not authenticated');

        if (session?.user && mounted) {
          // Ensure user exists in users table
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single();

            if (!existingUser) {
              console.log('Creating user record...');
              const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: session.user.id, email: session.user.email! }]);

              if (insertError) {
                console.error('Error inserting user:', insertError);
              }
            }
          } catch (userError) {
            console.error('Error handling user creation:', userError);
          }
        }

        if (mounted) {
          setUser(session?.user || null);
          setLoading(false);
        }

        // Listen for auth changes
        console.log('Setting up auth state listener...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('Auth state changed:', _event, session ? 'authenticated' : 'not authenticated');

            if (session?.user && _event === 'SIGNED_IN' && mounted) {
              // Ensure user exists in users table
              try {
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('id')
                  .eq('id', session.user.id)
                  .single();

                if (!existingUser) {
                  console.log('Creating user record on sign in...');
                  const { error: insertError } = await supabase
                    .from('users')
                    .insert([{ id: session.user.id, email: session.user.email! }]);

                  if (insertError) {
                    console.error('Error inserting user on sign in:', insertError);
                  }
                }
              } catch (userError) {
                console.error('Error handling user creation on sign in:', userError);
              }
            }

            if (mounted) {
              setUser(session?.user || null);
              setLoading(false);
              if (_event === 'SIGNED_OUT') {
                router.push('/');
              }
            }
          }
        );

        return () => {
          console.log('Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Critical error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Cleanup function
    return () => {
      mounted = false;
    };
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