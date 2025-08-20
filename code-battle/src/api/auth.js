// Functions for signup, login, logout.

import { supabase } from './supabaseClient';

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

function onAuthChange(callback) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  });
  return () => sub.subscription.unsubscribe()
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export default {getCurrentUser, onAuthChange, signIn, signOut, signUp}