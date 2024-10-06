// AnalysisCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./analysis-card.module.css"

export default function AnalysisCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={styles.value}>{value}</div>
        <p className={styles.description}>{description}</p>
      </CardContent>
    </Card>
  )
}