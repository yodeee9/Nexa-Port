"use client"

import { useState } from "react"
import PortfolioOverview from "@/components/portfolio-overview"
import PortfolioDetails from "@/components/portfolio-details"
import styles from "./portfolio-analysis.module.css"

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState("overall")

  return (
    <div className={styles.container}>
      <PortfolioOverview />
      <PortfolioDetails activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}