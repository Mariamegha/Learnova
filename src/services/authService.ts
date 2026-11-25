import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export function signInAsLocalUser(name: string) {
  const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 48);
  if (!displayName) {
    return { user: null, error: 'Please enter your name to continue.' };
  }

  const nameSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learner';
  const email = `${nameSlug}@local.edumite`;
  useUserStore.getState().login(email, displayName, 'local');
  useUserStore.setState({
    user: {
      name: displayName,
      email,
      xp: 0,
      level: 1,
      streak: 0,
    },
  });

  return { user: { id: `local-${nameSlug}`, email }, error: null };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { data: null, error: error.message || 'Failed to sign in with Google' };
  }
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, name }: SignUpData) {
  try {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Wait for the database trigger to create the profile automatically
    // The trigger should handle profile creation, but we'll wait and verify
    let profile = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profile && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (data && !error) {
        profile = data;
        break;
      }
      attempts++;
    }

    // If trigger didn't create the profile, try to create it manually
    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single();

      if (profileError) {
        // Check one more time if profile exists
        const { data: finalCheck } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!finalCheck) {
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
        profile = finalCheck;
      } else {
        profile = newProfile;
      }
    }

    // Update local store with profile data
    if (profile) {
      useUserStore.getState().login(profile.email, profile.name);
      useUserStore.setState({
        user: {
          name: profile.name,
          email: profile.email,
          xp: profile.xp || 0,
          level: profile.level || 1,
          streak: profile.streak || 0,
        },
      });
    }

    return { user: authData.user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message || 'Failed to sign up' };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Update local store
    useUserStore.getState().login(profile.email, profile.name);
    useUserStore.setState({
      user: {
        name: profile.name,
        email: profile.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
      },
    });

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message || 'Failed to sign in' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!isSupabaseConfigured || useUserStore.getState().authMode === 'local') {
    useUserStore.getState().logout();
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Update local store
    useUserStore.getState().logout();

    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    return { session: null, error: error.message };
  }
}

/**
 * Initialize auth state on app load
 */
export async function initializeAuth() {
  try {
    const { session, error } = await getSession();
    if (error || !session) {
      useUserStore.getState().logout();
      return;
    }

    // Fetch user profile
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // If profile doesn't exist (OAuth first-time user), create it
    if (profileError || !profile) {
      const userName = session.user.user_metadata?.name || 
                       session.user.user_metadata?.full_name || 
                       session.user.email?.split('@')[0] || 
                       'User';
      
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          name: userName,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user profile:', createError);
        useUserStore.getState().logout();
        return;
      }

      profile = newProfile;
    }

    // Update local store
    useUserStore.getState().login(profile.email, profile.name);
    useUserStore.setState({
      isAuthenticated: true,
      user: {
        name: profile.name,
        email: profile.email,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
      },
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    useUserStore.getState().logout();
  }
}

