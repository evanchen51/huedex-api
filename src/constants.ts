export const __prod__ = process.env.NODE_ENV === "production"
export const COOKIE_NAME = "qid"

// REDIS_KEY_
export const REDIS_HASH_KEY_LANGUAGE_CODES = "language.codes"

export const REDIS_HASH_KEY_POLL = "poll:"
export const REDIS_SET_KEY_POLL_OPTIONS = "poll.options:"
export const REDIS_SET_KEY_POLL_TOPICS = "poll.topics:"
export const REDIS_HASH_KEY_POLL_TEXTS = "poll.texts"

export const REDIS_HASH_KEY_OPTION = "option:"

export const REDIS_HASH_KEY_TOPIC = "topic:"
export const REDIS_SET_KEY_TOPIC_POLLS = "topic.polls:"
export const REDIS_SET_KEY_TOPIC_FOLLOWERS = "topic.followers:"
export const REDIS_SET_KEY_TOPICS = "topics"

export const REDIS_SET_KEY_USER_DISPLAY_NAMES = "users.display.names"
export const REDIS_HASH_KEY_USER = "user:"
export const REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES = "user.following.languages:"
export const REDIS_SET_KEY_USER_FOLLOWING_TOPICS = "user.following.topics:"
export const REDIS_SET_KEY_USER_FOLLOWING_USERS = "user.following.users:"
export const REDIS_SET_KEY_USER_FOLLOWERS = "user.followers:"
export const REDIS_HASH_KEY_USER_VOTE_HISTORY = "user.vote.history:"

export const REDIS_KEY_CREATE_POLL_TIMER = "create.poll.timer:"

export const REDIS_SORTEDSET_KEY_HOME_FEED = "home.feed:"

// REDIS_CACHE_CONVERT_
export const REDIS_CACHE_CONVERT_INT = ["numOfVotes", "numOfChoices"]
export const REDIS_CACHE_CONVERT_DATE = ["createdAt", "updatedAt"]
export const REDIS_CACHE_CONVERT_BOOLEAN = ["private", "sensitive","featured"]

// LanguageCodes
export const UNKNOWN = "un"
export const EN = "en"
export const ZH_TW = "zh-TW"

// MediaTypeCodes
export const IMAGE = "img"

// NO_VALUE_PLACEHOLDER
export const NO_VALUE_PLACEHOLDER = "_"
