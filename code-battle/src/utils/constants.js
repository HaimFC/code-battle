const BATTLE_STATUS = { WAITING: 'waiting', ONGOING: 'ongoing', FINISHED: 'finished' }
const RESULT_STATUS = { WIN: 'win', LOSS: 'loss', DRAW: 'draw' }
const TABLES = { USERS: 'users', QUESTIONS: 'questions', QUESTION_TESTS: 'question_tests', USER_SOLUTIONS: 'user_solutions', BATTLES: 'battles', RESULTS: 'results' }
const EVENTS = { PARTICIPANT_JOINED: 'participant_joined', BATTLE_STARTED: 'battle_started', SUBMISSION_RESULT: 'submission_result', BATTLE_FINISHED: 'battle_finished' }
const DEFAULT_LANGUAGE_ID = 63
const DEFAULT_K_FACTOR = 32

export { BATTLE_STATUS, RESULT_STATUS, TABLES, EVENTS, DEFAULT_LANGUAGE_ID, DEFAULT_K_FACTOR }
