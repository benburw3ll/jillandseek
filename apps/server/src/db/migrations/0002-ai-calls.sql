-- The model calls the capped client made (ADR-0007 point 6): one row per call, written before the
-- call is sent, so a crash never undercounts. Counts only: no request, no answer and no key.
-- `at` is ISO 8601 UTC text, so a UTC day or month is a range of it.

CREATE TABLE ai_calls (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,
  feature TEXT NOT NULL,
  model TEXT NOT NULL,
  outcome TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE INDEX ai_calls_at ON ai_calls (at);
