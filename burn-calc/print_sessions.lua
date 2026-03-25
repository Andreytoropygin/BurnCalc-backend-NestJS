-- print_sessions.lua

local pattern = 'session:*'
local result = {}

local keys = redis.call('KEYS', pattern)

for i, key in ipairs(keys) do
  local user_id = redis.call('GET', key)
  local ttl = redis.call('TTL', key)
  
  table.insert(result, {key, user_id, ttl})
end

return result