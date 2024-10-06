import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, BarChart3Icon, TrendingUpIcon, AlertTriangleIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// Sample data
const portfolioData = [
  { name: "Stocks", value: 60 },
  { name: "Bonds", value: 25 },
  { name: "Real Estate", value: 10 },
  { name: "Cash", value: 5 },
]

const stocksData = [
  { name: "Apple Inc.", symbol: "AAPL", allocation: 15, performance: 8.5 },
  { name: "Microsoft Corporation", symbol: "MSFT", allocation: 12, performance: 10.2 },
  { name: "Amazon.com Inc.", symbol: "AMZN", allocation: 10, performance: -2.3 },
  { name: "Alphabet Inc.", symbol: "GOOGL", allocation: 8, performance: 5.7 },
  { name: "Tesla Inc.", symbol: "TSLA", allocation: 7, performance: -12.5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const suggestions = [
  {
    id: 1,
    title: "Increase International Exposure",
    description: "Consider adding more international stocks to diversify geographical risk.",
  },
  {
    id: 2,
    title: "Rebalance Tech Sector",
    description: "Your portfolio is heavily weighted in tech. Consider rebalancing to reduce sector-specific risk.",
  },
  {
    id: 3,
    title: "Add Bond Allocation",
    description: "Increase your bond allocation to provide more stability and income.",
  },
]

export function PortfolioAnalysisComponent() {
  const [activeTab, setActiveTab] = useState("overall")
  const [feedbackStates, setFeedbackStates] = useState({})

  const handleFeedback = (suggestionId, isPositive) => {
    setFeedbackStates(prev => ({
      ...prev,
      [suggestionId]: isPositive
    }))
    toast({
      title: "Feedback Received",
      description: `Thank you for your feedback on suggestion ${suggestionId}.`,
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-full lg:w-1/3 p-4 bg-white">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Holdings</h3>
              <ScrollArea className="h-[300px]">
                {stocksData.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{stock.name}</p>
                      <p className="text-sm text-gray-500">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{stock.allocation}%</p>
                      <p
                        className={`text-sm ${
                          stock.performance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.performance >= 0 ? "+" : ""}
                        {stock.performance.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Portfolio Analysis</CardTitle>
            <CardDescription>Overall, Performance, and Risk Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overall">Overall</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
              </TabsList>
              <TabsContent value="overall">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Portfolio Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">85/100</span>
                        <Progress value={85} className="w-2/3" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your portfolio is performing well with a good balance of risk and return. The diversification 
                        across different asset classes is appropriate, but there's room for minor improvements in sector 
                        allocation. Consider rebalancing to maintain your target allocation and potentially increasing 
                        exposure to international markets for better geographical diversification.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Portfolio Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                            <div className="flex justify-between items-center">
                              <div className="space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeedback(suggestion.id, true)}
                                  className={feedbackStates[suggestion.id] === true ? "bg-green-100" : ""}
                                >
                                  <ThumbsUpIcon className="w-4 h-4 mr-2" />
                                  Helpful
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeedback(suggestion.id, false)}
                                  className={feedbackStates[suggestion.id] === false ? "bg-red-100" : ""}
                                >
                                  <ThumbsDownIcon className="w-4 h-4 mr-2" />
                                  Not Helpful
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance">
                <div className="space-y-4">
                  <AnalysisCard
                    title="Total Return"
                    value="+12.5%"
                    description="Your portfolio has outperformed the benchmark by 2.3%"
                    icon={<TrendingUpIcon className="h-4 w-4 text-green-600" />}
                  />
                  <AnalysisCard
                    title="Top Performer"
                    value="MSFT"
                    description="Microsoft Corp. has the highest return in your portfolio."
                    icon={<ArrowUpIcon className="h-4 w-4 text-green-600" />}
                  />
                  <AnalysisCard
                    title="Underperformer"
                    value="TSLA"
                    description="Tesla Inc. is currently underperforming. Consider reviewing."
                    icon={<ArrowDownIcon className="h-4 w-4 text-red-600" />}
                  />
                </div>
              </TabsContent>
              <TabsContent value="risk">
                <div className="space-y-4">
                  <AnalysisCard
                    title="Volatility"
                    value="Moderate"
                    description="Portfolio beta: 1.05. Slightly more volatile than the market."
                    icon={<BarChart3Icon className="h-4 w-4 text-blue-600" />}
                  />
                  <AnalysisCard
                    title="Anomaly"
                    value="Low"
                    description="No significant anomalies detected in recent performance."
                    icon={<AlertTriangleIcon className="h-4 w-4 text-green-600" />}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AnalysisCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}