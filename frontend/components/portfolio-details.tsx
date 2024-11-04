import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpIcon, ArrowDownIcon, BarChart3Icon, TrendingUpIcon, AlertTriangleIcon, ThumbsUpIcon, ThumbsDownIcon, BarChart2Icon, TrendingDownIcon,ChartBarBig } from "lucide-react"
import AnalysisCard from "./analysis-card"
import RiskCard from "./risk-card"
import styles from "./portfolio-details.module.css"
import { useEffect, useState } from "react"
import { AnalysisResult } from '../types';
import { Button } from "./ui/button"
import { toast, Toaster } from 'react-hot-toast';


const suggestion = {
    improvement: 10
}

interface PortfolioDetailsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PortfolioDetails({ activeTab, setActiveTab }: PortfolioDetailsProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
      const parsedResult: AnalysisResult = JSON.parse(storedResult);
      setAnalysisData(parsedResult);
    }
  }, [])


  if (!analysisData) return <div>Loading...</div>

  return (
    <div className={styles.container}>
      <Toaster position="bottom-right" />
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
          <CardDescription>Overall, Performance, and Risk Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger className={styles.tab} value="overall">Overall</TabsTrigger>
              <TabsTrigger className={styles.tab} value="performance">Performance</TabsTrigger>
              <TabsTrigger className={styles.tab} value="risk">Risk</TabsTrigger>
            </TabsList>
            <TabsContent value="overall">
              <OverallAnalysis data={analysisData} />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceAnalysis data={analysisData} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskAnalysis data={analysisData}  />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function OverallAnalysis({ data }: { data: AnalysisResult }) {
  const [feedbackStates, setFeedbackStates] = useState({})

  const handleFeedback = (suggestionId: number, isPositive: boolean) => {
    setFeedbackStates(prev => ({
      ...prev,
      [suggestionId]: isPositive
    }))
    toast.success(`Thank you for your ${isPositive ? 'positive' : 'negative'} feedback on suggestion.`, {
      duration: 3000,
      icon: isPositive ? '👍' : '👎',
    });
  }

  return (
    <div>
      <div className={styles.analysisContainer}>
        <Card>
          <CardHeader>
            <CardTitle>Overall Portfolio Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.overallContent}>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-base font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-100">
                      Current Score
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-semibold inline-block text-primary">
                      {data.overall_score }%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                  <div style={{ width: `${data.overall_score }%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                </div>
              </div>
              <p className={styles.description}>{data.overall_analysis}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Suggestion</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Potential Improvement
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold inline-block text-green-600">
                    +{data.potential_improvement_score}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                <div style={{ width: `${data.overall_score }%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                <div style={{ width: `${data.potential_improvement_score}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            <div className={styles.overallContent}>
              <p className={styles.description}>{data.portfolio_suggestion}</p>
            </div>
            <div className={styles.feedbackContainer}>
              <div className={styles.feedbackButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(1, true)}
                  className={`${styles.feedbackButton} ${feedbackStates[1] === true ? styles.helpfulButton : ''}`}
                >
                  <ThumbsUpIcon className="w-4 h-4 mr-2" />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(1, false)}
                  className={`${styles.feedbackButton} ${feedbackStates[1] === false ? styles.notHelpfulButton : ''}`}
                >
                  <ThumbsDownIcon className="w-4 h-4 mr-2" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PerformanceAnalysis({ data }: { data: AnalysisResult }) {
  return (
    <div className={styles.analysisContainer}>
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.overallContent}>
              <p className={styles.description}>{data.performance_overview}</p>
            </div>
          </CardContent>
        </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisCard
          title="Total Return"
          value={data.total_return}
          description={`Your portfolio has outperformed the benchmark by ${data.benchmark_outperformance}`}
          icon={<TrendingUpIcon className="h-8 w-8 text-green-600" />}
        />
        <AnalysisCard
          title="Sharpe Ratio (1 Year)"
          value={data.sharp_ratio}
          description={data.sharp_ratio_explanation}
          icon={<BarChart2Icon className="h-4 w-4 text-green-600" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisCard
          title="Top Performer"
          value={data.top_performer.ticker}
          description={`${data.top_performer.name} has the highest return in your portfolio.`}
          icon={<ArrowUpIcon className="h-8 w-8 text-green-600" />}
        />
        <AnalysisCard
          title="Underperformer"
          value={data.underperformer.ticker}
          description={`${data.underperformer.name} is currently underperforming. Consider reviewing.`}
          icon={<ArrowDownIcon className="h-8 w-8 text-blue-600" />}
        />
      </div>
      <AnalysisCard
          title="CAGR"
          value={data.portfolio_cagr}
          description={data.portfolio_cagr_explanation}
          icon={<TrendingUpIcon className="h-8 w-8 text-green-600" />}
        />
    </div>
  )
}

function RiskAnalysis({ data }: { data: AnalysisResult }) {
  return (
    <div className={styles.analysisContainer}>
      <RiskCard
        title="Volatility"
        value={data.volatility}
        description={`${data.volatility_explanation}`}
        icon={<BarChart3Icon className="h-6 w-6 text-blue-600" />}
        titleStyle="titleBlue"
      />
      <RiskCard
        title="Anomaly"
        value={data.anomaly}
        description={`${data.anomaly_explanation}`}
        icon={<AlertTriangleIcon className="h-6 w-6 text-green-600" />}
        titleStyle="titleGreen"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisCard
          title="Sortino Ratio (1 Year)"
          value={data.sortino_ratio}
          description={data.sortino_ratio_explanation}
          icon={<BarChart2Icon className="h-4 w-4 text-red-600" />}
        />
        <AnalysisCard
          title="Max Drawdown (1 Year)"
          value={data.max_drawdown}
          description={data.max_drawdown_explanation}
          icon={<TrendingDownIcon className="h-4 w-4 text-blue-600" />}
        />
      </div>
    </div>
  )
}