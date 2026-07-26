"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"

// 성향 유형별 질문 데이터
const personalityQuestions = {
  I: [
    "일을 잘 하기 위해 깊게 생각하고 행동한다.",
    "근면하고 책임감이 강하다.",
    "원칙에 기초를 두고 행동한다.",
    "완벽을 위해 인내하고 노력한다.",
    "규칙을 잘 지킨다.",
    "다른 사람의 신임을 얻을 수 있다.",
    "근면하고 성실하다.",
    "양심과 이성에 따른다.",
    "정직하고 자제력이 있다.",
  ],
  A: [
    "사람들과 함께 일하기를 선호한다.",
    "다른 사람들을 도와주는 것을 좋아한다.",
    "칭찬을 잘 한다.",
    "나보다 남에게 공감할 때가 더 많다.",
    "남이 나에게 의지할때 기분이 좋다",
    "사람들에게 관심을 갖고 보살피려 한다.",
    "사람들과 친해지려고 노력한다.",
    "타인의 만족을 위해 노력한다.",
    "타인의 호감을 얻기 위해 노력한다.",
  ],
  B: [
    "능력 발휘를 위해 시간을 투자한다.",
    "과정보다 결과를 중시한다.",
    "인간중심적이기보다는 목표중심적이다.",
    "적응력이 뛰어나 대응을 잘한다.",
    "다른 사람들에게 지나친 경쟁을 강요한다.",
    "사람들에 대한 배려보다는 일의 성취를 더 중요시한다.",
    "실패를 두려워해 과장하는 경향이 있다.",
    "침체에 빠지지 않고 끊임없이 행동한다.",
    "성공만이 애정을 얻을 수 있다 생각한다.",
  ],
  C: [
    "감정적이어서 혼자 있을 때가 많다.",
    "자신만의 취미를 즐긴다.",
    "낭만적이고 예술적 기질이 있다.",
    "이방인처럼 느낄 때가 있다.",
    "독특한 감정을 가지고 있다.",
    "분위기에 약하고 자기 생각에 골몰하는 편이다.",
    "내 행동의 동기, 감정에 회의적 생각이 들기도한다.",
    "감동적인 것을 추구하다가 우울해지기도 한다.",
    "비현실적이며 몽상가적 기질이 있다.",
  ],
  D: [
    "집중력이 좋고 통찰력이 있다.",
    "문제를 해결할 때까지 생각한다.",
    "공적인 것 보다는 개인생황에 관심이 많다.",
    "감정보다는 이성을 추구한다.",
    "시간과 돈을 아끼려한다.",
    "나를 둘러싼 세상을 이해하는 것에 관심이 있다.",
    "권위와 규칙에 얽매이지 않는다.",
    "지적이고 냉청하게 관찰하는 편이다.",
    "머리로 이해하고 판단한다.",
  ],
  E: [
    "명확한 지침이 있을 때 능률이 오른다.",
    "사람들을 가끔 의심한다.",
    "성공에 대해서 가끔 평가 절하한다.",
    "조직이나 집단에 헌신한다.",
    "안전을 중요시 생각한다.",
    "사람들이 용기가 필요하다고 한다.",
    "결과에 대한 두려움에 일을 미룬다.",
    "믿을만한 사람이라고 생각하면 헌신한다.",
    "친한 사람들과 관계를 계속 유지하려고 한다.",
  ],
  F: [
    "재미있는 일을 즐긴다.",
    "모험적이며 위험을 감수한다.",
    "끊임없이 변화하는 생활을 즐긴다.",
    "자극을 유발하는 활동을 즐긴다.",
    "명량하고 순진하다.",
    "미래에 대해 열정을 가고 있다.",
    "여러 가지일을 즐기며 새로운 경험을 찾는다.",
    "한 가지 일에 정착하기 어렵다.",
    "현실에 만족하지 않고 새로운 일을 추구한다.",
  ],
  G: [
    "리더로서 기질이 있다.",
    "의사결정할 때 리더쉽을 발휘한다.",
    "늘 강해야 한다고 생각한다.",
    "사람들에게 영향력있는 사람이다.",
    "다른 사람들이 말하기 어려워 하는 것을 이야기 한다.",
    "자기주장이 강하다.",
    "사람들을 통제하려고 한다.",
    "사람들을 지시하고 동기부여를 한다.",
    "강한 자신감으로 사람들을 설득한다.",
  ],
  H: [
    "자기만족적이며 태평하다.",
    "감정동요가 많지 않은 원만한 사람이다.",
    "갈등을 피할려고 한다.",
    "사람들과 긴장을 풀고 편하게 지낸다.",
    "유쾌하고 편하게 대한다.",
    "사람들은 나를 좋다.",
    "낙관적으로 생각한다.",
    "내 일과 다른 사람들의 일은 상관이 없다.",
    "조화로움을 추구하는 평화주의자다.",
  ],
  J: [
    "우울증 및 불안감 상담을 받아본 적이 있다.",
    "1년이네 정신 관련 약 복용한적 있다.",
    "투자나 코인에 관심이 있다.",
    "현재 이성보다는 동성에 호감이간다.",
  ],
}

// 성향 유형별 설명과 이미지
const personalityTypes = {
  I: {
    name: "필라테스",
    description: "정확한 자세와 균형을 중요하게 생각하는 당신에게 딱 맞는 운동입니다",
    image: "/fil.jpg",
  },
  A: {
    name: "배드민턴",
    description: "함께 호흡하고 협력하는 과정에서 즐거움을 느낄 수 있습니다",
    image: "/bad.jpg",
  },
  B: {
    name: "크로스핏",
    description: "목표를 세우고 기록을 달성하며 성취감을 얻을 수 있습니다",
    image: "/hel.jpg",
  },
  C: {
    name: "폴댄스",
    description: "나만의 개성과 감정을 자유롭게 표현할 수 있습니다",
    image: "/pol.jpg",
  },
  D: {
    name: "암벽등반",
    description: "전략을 세우고 문제를 해결하는 재미를 느낄 수 있습니다",
    image: "/clime.jpg",
  },
  E: {
    name: "등반",
    description: "꾸준히 도전하며 안정감과 만족감을 얻을 수 있습니다",
    image: "/mount.jpg",
  },
  F: {
    name: "줌바",
    description: "신나고 다양한 움직임으로 지루할 틈 없이 즐길 수 있습니다",
    image: "/zumba.jpg",
  },
  G: {
    name: "복싱",
    description: "강한 에너지를 마음껏 발휘하며 도전할 수 있습니다",
    image: "/box.jpg",
  },
  H: {
    name: "요가",
    description: "몸과 마음의 균형을 찾으며 편안함을 느낄 수 있습니다",
    image: "/yoga.jpg",
  },
  J: {
    name: "특별 유형",
    description: "개인적 특성 분석",
    image: "/zumba.jpg",
  },
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 모든 질문을 순서대로 배열
const allQuestions = Object.entries(personalityQuestions).flatMap(([type, questions]) =>
  questions.map((question, index) => ({
    id:
      type === "J"
        ? 81 + index + 1 // J 유형은 82-85번
        : Object.keys(personalityQuestions).indexOf(type) * 9 + index + 1,
    type,
    question,
    typeIndex: index,
  })),
)

const scaleLabels = ["전혀 그렇지 않다", "대체로 그렇지 않다", "보통이다", "대체로 그렇다", "매우 그렇다"]

export default function PersonalityTest() {
  const [participantName, setParticipantName] = useState("")
  const [testStarted, setTestStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof allQuestions>([])

  const ensureTableExists = async () => {
    if (!supabase) {
      console.warn("[v0] Supabase not configured")
      return false
    }

    try {
      // 먼저 간단한 쿼리로 테이블 존재 확인
      const { error: checkError } = await supabase.from("personality_test_results").select("id").limit(1)

      // 테이블이 존재하면 true 반환
      if (!checkError) {
        return true
      }

      // 테이블이 없으면 생성 시도 (에러 무시)
      console.log("[v0] Table does not exist, attempting to create...")

      // Supabase에서 직접 테이블 생성은 권한 문제로 실패할 수 있음
      // 이 경우 사용자가 Supabase 대시보드에서 수동으로 생성해야 함
      return false
    } catch (error) {
      console.error("[v0] Error checking table:", error)
      return false
    }
  }

  const startTest = () => {
    if (participantName.trim()) {
      setShuffledQuestions(shuffleArray(allQuestions))
      setTestStarted(true)
    }
  }

  const handleAnswer = (score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [shuffledQuestions[currentQuestion].id]: score,
    }))

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      calculateResults()
    }
  }

  const calculateResults = async () => {
    setSaving(true)

    const scores: Record<string, number> = {
      I: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0,
      H: 0,
      J: 0,
    }

    const detailedScores: Record<string, number[]> = {
      I: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
      G: [],
      H: [],
      J: [],
    }

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = allQuestions.find((q) => q.id === Number.parseInt(questionId))
      if (question) {
        scores[question.type] += score
        detailedScores[question.type][question.typeIndex] = score
      }
    })

    const sortedResults = Object.entries(scores)
      .filter(([type]) => type !== "J") // J 유형 제외
      .sort(([, a], [, b]) => b - a)
      .map(([type, score]) => ({
        type,
        score,
        name: personalityTypes[type as keyof typeof personalityTypes].name,
      }))

    const topThreeTypes = sortedResults.slice(0, 3).map((result) => result.type)

    try {
      if (!supabase) {
        console.log("[v0] Supabase not configured. Results will be displayed but not saved.")
      } else {
        const tableExists = await ensureTableExists()

        if (tableExists) {
          const { error } = await supabase.from("personality_test_results").insert({
            participant_name: participantName,
            answers: answers,
            results: sortedResults,
            top_personalities: topThreeTypes,
            detailed_scores: detailedScores,
            j_scores: detailedScores.J,
          })

          if (error) {
            console.error("[v0] Error saving to database:", error)
            console.log("[v0] Results will still be displayed, but not saved to database")
          } else {
            console.log("[v0] Results saved successfully")
          }
        } else {
          console.log("[v0] Table does not exist. Please create it manually in Supabase dashboard.")
          console.log("[v0] Results will be displayed but not saved.")
        }
      }
    } catch (error) {
      console.error("[v0] Database error:", error)
      console.log("[v0] Continuing to show results despite database error")
    }

    setSaving(false)
    setShowResults(true)
  }

  const getTopThreeTypes = () => {
    const scores: Record<string, number> = {
      I: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0,
      H: 0,
      J: 0,
    }

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = allQuestions.find((q) => q.id === Number.parseInt(questionId))
      if (question) {
        scores[question.type] += score
      }
    })

    return Object.entries(scores)
      .filter(([type]) => type !== "J")
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({ type, score }))
  }

  const resetTest = () => {
    setParticipantName("")
    setTestStarted(false)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setShuffledQuestions([])
  }

if (!testStarted) {
    return (
      <div
        className="min-h-screen relative overflow-hidden bg-green-800"
        style={{
          backgroundImage: "url('/Back.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* 배경 사진 위에 은은한 다크 오버레이 - 카드가 더 도드라지도록 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)",
          }}
        ></div>

        <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto w-full">
            <div className="badminton-glow-card">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl">
                <CardHeader className="text-center pb-6">
                  <div className="mb-4 flex justify-center">
                    <img src="/badminton_transparent.png" alt="배드민턴" className="w-16 h-16 object-contain" />
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-green-700 tracking-tight leading-snug">
                    나에게 맞는 운동은?
                  </CardTitle>
                  <CardDescription className="text-base text-slate-500 mt-2">
                    어떤 운동이 잘 어울릴까?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      참여자 이름
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="이름을 입력해주세요"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="w-full border-green-200 focus:border-green-400 focus:ring-green-400/20 rounded-xl"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && participantName.trim()) {
                          startTest()
                        }
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={startTest}
                      disabled={!participantName.trim()}
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white px-10 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                    >
                      Play
                    </Button>
                  </div>

                  <div className="bg-green-50/80 rounded-lg p-4 space-y-2">
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>각 질문에 대해 1-5점으로 평가</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>소요시간: 약 10-15분</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>질문 순서는 매번 랜덤하게 섞입니다</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const topThree = getTopThreeTypes()

    return (
      <div className="min-h-screen relative overflow-hidden badminton-bg">
        <div className="relative z-10 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="badminton-glow-card">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <img src="/badminton_transparent.png" alt="배드민턴" className="w-16 h-16 object-contain" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold text-green-700 tracking-tight">
                    성향 분석 결과
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-500 mt-2">
                    {participantName}님의 상위 3가지 성향
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {topThree.map((result, index) => (
                    <div
                      key={result.type}
                      className="flex items-center space-x-6 p-6 bg-green-50/80 rounded-lg border border-green-200/50"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={personalityTypes[result.type as keyof typeof personalityTypes].image || "/placeholder.svg"}
                          alt={personalityTypes[result.type as keyof typeof personalityTypes].name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-green-200 shadow-lg"
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge
                            variant="secondary"
                            className="text-lg px-3 py-1 bg-gradient-to-r from-green-500 to-orange-400 text-white"
                          >
                            {index + 1}위
                          </Badge>
                          <h3 className="text-xl font-semibold text-slate-700">
                            {personalityTypes[result.type as keyof typeof personalityTypes].name}
                          </h3>
                        </div>
                        <p className="text-slate-600 mb-2">
                          {personalityTypes[result.type as keyof typeof personalityTypes].description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500">
                            유형 {result.type} • 점수: {result.score}점 / 45점
                          </p>
                          <div className="text-xl font-bold text-orange-500">
                            {Math.round((result.score / 45) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-6 text-center space-y-3">
                    <Button
                      onClick={resetTest}
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                    >
                      다시 테스트하기
                    </Button>
                    <div>
                      <Button
                        onClick={() => window.open("/admin", "_blank")}
                        variant="outline"
                        className="ml-4 px-6 py-2 border-green-300 text-green-700 hover:bg-green-50 rounded-full"
                      >
                        관리자 페이지
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (saving) {
    return (
      <div className="min-h-screen relative overflow-hidden badminton-bg">
        <div className="relative z-10 p-4 flex items-center justify-center min-h-screen">
          <div className="badminton-glow-card">
            <Card className="shadow-2xl border-0 bg-white rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-lg text-slate-600">결과를 저장하고 있습니다...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100
  const currentQ = shuffledQuestions[currentQuestion]

  return (
    <div className="min-h-screen relative overflow-hidden badminton-bg">
      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="badminton-glow-card">
            <Card className="shadow-2xl border-0 bg-white rounded-3xl">
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-2xl font-extrabold text-green-700">
                    나에게 맞는 운동은?
                  </CardTitle>
                  <Badge variant="outline" className="text-sm border-green-300 text-green-700">
                    {currentQuestion + 1} / {shuffledQuestions.length}
                  </Badge>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800">
                    {currentQuestion + 1}. {currentQ.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {scaleLabels.map((label, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full p-4 text-left justify-start hover:bg-green-50/80 hover:border-green-300 bg-white border-slate-200 rounded-xl"
                      onClick={() => handleAnswer(index + 1)}
                    >
                      <span className="font-semibold text-orange-500 mr-3">{index + 1}</span>
                      <span className="text-slate-700">{label}</span>
                    </Button>
                  ))}
                </div>

                {currentQuestion > 0 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentQuestion((prev) => prev - 1)}
                      className="text-slate-500 hover:text-green-700 hover:bg-green-50/50"
                    >
                      이전 질문으로
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}