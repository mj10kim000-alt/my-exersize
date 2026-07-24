-- Create table for storing personality test results
DROP TABLE IF EXISTS personality_test_results CASCADE;

CREATE TABLE personality_test_results (
  id SERIAL PRIMARY KEY,
  participant_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  top_personalities TEXT[] NOT NULL,
  detailed_scores JSONB NOT NULL,
  j_scores JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_personality_test_results_created_at ON personality_test_results(created_at DESC);
CREATE INDEX idx_personality_test_results_name ON personality_test_results(participant_name);

-- Disable Row Level Security for easier testing
ALTER TABLE personality_test_results DISABLE ROW LEVEL SECURITY;
