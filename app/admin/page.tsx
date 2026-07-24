"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, TrendingUp, Download, Table, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface TestResult {
  id: string
  participant_name: string
  created_at: string
  answers: Record<string, number>
  results: Array<{ type: string; score: number; name: string }>
  top_personalities: string[]
  detailed_scores?: Record<string, number[]>
  j_scores?: number[]
}

interface PersonalityStats {
  type: string
  count: number
  percentage: number
}

export default function AdminPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [stats, setStats] = useState<PersonalityStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTests, setTotalTests] = useState(0)
  const [showTable, setShowTable] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (!supabase) {
      console.warn("[v0] Supabase not configured")
      setLoading(false)
      setDbError("Supabase가 구성되지 않았습니다")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/admin/login")
        return
      }

      setUser(user)
      fetchResults()
    } catch (error: any) {
      console.error("[v0] Auth check failed:", error)
      setLoading(false)
      setDbError("인증 확인 중 오류가 발생했습니다")
    }
  }

  const fetchResults = async () => {
    if (!supabase) {
      console.warn("[v0] Supabase not configured")
      setDbError("Supabase가 구성되지 않았습니다")
      setResults([])
      setTotalTests(0)
      setStats([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("personality_test_results")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching results:", error)
        setDbError(error.message)
        setResults([])
        setTotalTests(0)
        setStats([])
        setLoading(false)
        return
      }

      setDbError(null)
      setResults(data || [])
      setTotalTests(data?.length || 0)
      calculateStats(data || [])
    } catch (error: any) {
      console.error("Error fetching results:", error)
      setDbError(error?.message || "알 수 없는 오류")
      setResults([])
      setTotalTests(0)
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: TestResult[]) => {
    const personalityCount: Record<string, number> = {}

    data.forEach((result) => {
      result.top_personalities.forEach((personality) => {
        personalityCount[personality] = (personalityCount[personality] || 0) + 1
      })
    })

    const statsArray = Object.entries(personalityCount)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / data.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    setStats(statsArray)
  }

  const exportToCSV = () => {
    const headers = [
      "참여자명",
      "날짜",
      "I점수",
      "A점수",
      "B점수",
      "C점수",
      "D점수",
      "E점수",
      "F점수",
      "G점수",
      "H점수",
      "J1점수",
      "J2점수",
      "J3점수",
      "J4점수",
      "상위 성향 1",
      "상위 성향 2",
      "상위 성향 3",
    ]
    const csvData = results.map((result) => {
      const scores = ["I", "A", "B", "C", "D", "E", "F", "G", "H"].map((type) => {
        const found = result.results.find((r) => r.type === type)
        return found ? found.score : 0
      })

      const jScores = result.j_scores || [0, 0, 0, 0]

      return [
        result.participant_name || "익명",
        new Date(result.created_at).toLocaleDateString("ko-KR"),
        ...scores,
        ...jScores,
        result.top_personalities[0] || "",
        result.top_personalities[1] || "",
        result.top_personalities[2] || "",
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `personality_test_results_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const getPersonalityName = (type: string) => {
    const names: Record<string, string> = {
      I: "완벽주의자",
      A: "조력자",
      B: "성취자",
      C: "예술가",
      D: "사색가",
      E: "충성가",
      F: "모험가",
      G: "중재자",
      H: "평화주의자",
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-lg text-white">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-between items-center">
            <div></div>
            <div>
              <h1 className="text-3xl font-bold text-white">성향 분석 관리자 페이지</h1>
              <p className="text-purple-200">테스트 결과 통계 및 관리</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-purple-400 text-purple-200 hover:bg-purple-800 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-sm text-purple-200">로그인된 관리자: {user.email}</div>
          </CardContent>
        </Card>

        {dbError && (
          <Card className="bg-yellow-900/20 border-yellow-500/30 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-yellow-200 text-center">
                <p className="font-medium mb-2">⚠️ 데이터베이스 연결 오류</p>
                <p className="text-sm">
                  오류 메시지: {dbError}
                  <br />
                  테이블이 존재하지 않는다면 Supabase 대시보드에서 SQL 에디터를 열고 다음 SQL을 실행하세요:
                </p>
                <pre className="mt-4 p-4 bg-slate-900/50 rounded text-left text-xs overflow-x-auto">
                  {`CREATE TABLE IF NOT EXISTS personality_test_results (
  id SERIAL PRIMARY KEY,
  participant_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  top_personalities TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detailed_scores JSONB NOT NULL,
  j_scores JSONB NOT NULL
);

ALTER TABLE personality_test_results DISABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {!dbError && totalTests === 0 && (
          <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-blue-200 text-center">
                <p className="font-medium mb-2">📊 데이터 없음</p>
                <p className="text-sm">
                  아직 테스트 결과가 없습니다.
                  <br />
                  메인 페이지에서 테스트를 완료하면 결과가 여기에 표시됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">총 테스트 수</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTests}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">최근 테스트</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {results.length > 0 ? new Date(results[0].created_at).toLocaleDateString("ko-KR") : "없음"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">가장 많은 성향</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">
                {stats.length > 0 ? `${getPersonalityName(stats[0].type)} (${stats[0].count}회)` : "없음"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personality Statistics */}
        {stats.length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">성향별 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{getPersonalityName(stat.type)}</div>
                      <div className="text-sm text-purple-300">유형 {stat.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{stat.count}회</div>
                      <div className="text-sm text-purple-300">{stat.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Results */}
        {results.length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">테스트 결과 {showTable ? "테이블" : "목록"}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowTable(!showTable)}
                    variant="outline"
                    size="sm"
                    className="border-purple-400 text-purple-200 hover:bg-purple-800 bg-transparent"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    {showTable ? "카드 뷰" : "테이블 뷰"}
                  </Button>
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="border-purple-400 text-purple-200 hover:bg-purple-800 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV 내보내기
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showTable ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-purple-500/20">
                    <thead>
                      <tr className="bg-slate-700/50">
                        <th className="border border-purple-500/20 px-4 py-2 text-left text-purple-200">참여자명</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-left text-purple-200">날짜</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">I</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">A</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">B</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">C</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">D</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">E</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">F</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">G</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">H</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">J1</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">J2</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">J3</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-center text-purple-200">J4</th>
                        <th className="border border-purple-500/20 px-4 py-2 text-left text-purple-200">상위 성향</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => {
                        const scores = ["I", "A", "B", "C", "D", "E", "F", "G", "H"].map((type) => {
                          const found = result.results.find((r) => r.type === type)
                          return found ? found.score : 0
                        })

                        const jScores = result.j_scores || [0, 0, 0, 0]

                        return (
                          <tr key={result.id} className="hover:bg-slate-700/30">
                            <td className="border border-purple-500/20 px-4 py-2 font-medium text-white">
                              {result.participant_name || "익명"}
                            </td>
                            <td className="border border-purple-500/20 px-4 py-2 text-purple-200">
                              {new Date(result.created_at).toLocaleDateString("ko-KR")}
                            </td>
                            {scores.map((score, index) => (
                              <td key={index} className="border border-purple-500/20 px-4 py-2 text-center">
                                <span
                                  className={`font-medium ${score >= 30 ? "text-green-400" : score >= 20 ? "text-yellow-400" : "text-purple-300"}`}
                                >
                                  {score}
                                </span>
                              </td>
                            ))}
                            {jScores.map((score, index) => (
                              <td key={`j-${index}`} className="border border-purple-500/20 px-4 py-2 text-center">
                                <span className="font-medium text-purple-400">{score || 0}</span>
                              </td>
                            ))}
                            <td className="border border-purple-500/20 px-4 py-2">
                              <div className="flex gap-1 flex-wrap">
                                {result.top_personalities.slice(0, 3).map((personality, index) => (
                                  <Badge
                                    key={index}
                                    variant={index === 0 ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {personality}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.slice(0, 10).map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 border border-purple-500/20 rounded-lg bg-slate-700/30"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {result.participant_name || "익명"} - {new Date(result.created_at).toLocaleString("ko-KR")}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {result.top_personalities.slice(0, 3).map((personality, index) => (
                            <Badge key={index} variant={index === 0 ? "default" : "secondary"}>
                              {getPersonalityName(personality)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-purple-300">최고 점수: {result.results[0]?.score || 0}점</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
