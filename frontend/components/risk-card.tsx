import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./risk-card.module.css"

export default function RiskCard({ 
  title, 
  value, 
  description, 
  icon, 
  titleStyle
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  titleStyle: string;
}) {
  return (
    <Card>
      <CardHeader className={styles.header}>
        <CardTitle className={`${styles[titleStyle]}`}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={styles.value}>{value}</div>
        <p className={styles.description}>{description}</p>
      </CardContent>
    </Card>
  )
}