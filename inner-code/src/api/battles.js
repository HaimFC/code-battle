// Functions for creating/updating battles

import { supabase } from './supabaseClient.js'
import { BATTLE_STATUS, TABLES } from '../utils/constants.js'

async function getUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const uid = data?.user?.id
  if (!uid) throw new Error('Not authenticated')
  return uid
}

async function createBattle(questionId) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from(TABLES.BATTLES)
    .insert({
      question_id: questionId,
      user_a: userId,
      user_b: null,
      status: BATTLE_STATUS.WAITING
    })
    .select()
    .single()
  if (error) throw error
  return data
}

async function listOpenBattles() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from(TABLES.BATTLES)
    .select('id, question_id, user_a, user_b, status, created_at')
    .eq('status', BATTLE_STATUS.WAITING)
    .neq('user_a', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function joinBattle(battleId) {
  const userId = await getUserId()

  const { data: battle, error: e1 } = await supabase
    .from(TABLES.BATTLES)
    .select('id, user_a, user_b, status')
    .eq('id', battleId)
    .single()
  if (e1) throw e1
  if (battle.user_b === userId) return battle
  if (battle.user_b && battle.user_b !== userId) throw new Error('Battle already has a second player')
  if (battle.status !== BATTLE_STATUS.WAITING) throw new Error('Battle is not joinable')

  const { data, error } = await supabase
    .from(TABLES.BATTLES)
    .update({ user_b: userId })
    .eq('id', battleId)
    .select()
    .single()
  if (error) throw error
  return data
}

async function getBattle(battleId) {
  const { data, error } = await supabase
    .from(TABLES.BATTLES)
    .select('id, question_id, user_a, user_b, status, created_at, updated_at')
    .eq('id', battleId)
    .single()
  if (error) throw error
  return data
}

async function updateBattleStatus(battleId, status) {
  const { data, error } = await supabase
    .from(TABLES.BATTLES)
    .update({ status })
    .eq('id', battleId)
    .select()
    .single()
  if (error) throw error
  return data
}

async function saveBattleResult(resultRow) {
  const { data, error } = await supabase
    .from(TABLES.RESULTS)
    .insert(resultRow)
    .select()
    .single()
  if (error) throw error
  return data
}

export default { saveBattleResult, updateBattleStatus, getBattle, joinBattle, listOpenBattles, createBattle }
