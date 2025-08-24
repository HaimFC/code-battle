import { supabase } from "./supabaseClient";

async function signUp({ email, password, displayName, firstName, lastName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName ?? null,
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        phone: phone ?? null,
      },
      // emailRedirectTo: `${window.location.origin}/login`, // optional
    },
  });
  if (error) throw error;
  return data.user;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}

async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user ?? null;
}

export { getCurrentUser, onAuthChange, signIn, signOut, signUp };
