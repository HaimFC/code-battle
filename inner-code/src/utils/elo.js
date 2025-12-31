// Calculate new ELO score after battle.

import { DEFAULT_K_FACTOR } from './constants.js'

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

function updateElo(ratingA, ratingB, scoreA, scoreB, k = DEFAULT_K_FACTOR) {
  const expectedA = expectedScore(ratingA, ratingB)
  const expectedB = expectedScore(ratingB, ratingA)
  const newRatingA = ratingA + k * (scoreA - expectedA)
  const newRatingB = ratingB + k * (scoreB - expectedB)
  return { newRatingA: Math.round(newRatingA), newRatingB: Math.round(newRatingB) }
}

export { expectedScore, updateElo }

