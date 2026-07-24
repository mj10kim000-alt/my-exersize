-- 성향 테스트 결과를 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS personality_test_results (
  id SERIAL PRIMARY KEY,
  participant_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  top_personalities TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블에 대한 RLS 정책 설정 (필요한 경우)
ALTER TABLE personality_test_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 생성
CREATE POLICY "Enable read access for all users" ON personality_test_results FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON personality_test_results FOR INSERT WITH CHECK (true);
