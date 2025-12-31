// Functions for fetching questions.

import { supabase } from './supabaseClient.js'

async function getQuestions({ difficulty, q } = {}) {
  let query = supabase
    .from('questions')
    .select('id, title, difficulty, categories')
    .order('created_at', { ascending: false })

  if (difficulty) query = query.eq('difficulty', difficulty)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

async function getQuestionWithTests(questionId) {
  const { data: question, error: e1 } = await supabase
    .from('questions')
    .select('id, title, description, difficulty, categories')
    .eq('id', questionId)
    .single()

  if (e1) throw e1

  const { data: tests, error: e2 } = await supabase
    .from('question_tests')
    .select('id, input, expected_output, is_hidden')
    .eq('question_id', questionId)
    .order('id', { ascending: true })

  if (e2) throw e2

  return { question, tests }
}

export { getQuestions, getQuestionWithTests }
