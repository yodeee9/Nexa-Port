import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import styles from "./portfolio-overview.module.css";
import { PortfolioItem } from '@/types';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState([]);
  const [holdingsData, setHoldingsData] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('parsedData')) {
      console.log('No data found in local storage');
      localStorage.setItem('parsedData', JSON.stringify([]));
    }
    const uploadedData = JSON.parse(localStorage.getItem('parsedData') || '[]');
    processData(uploadedData);
  }, []);

  const processData = (data: PortfolioItem) => {
    const totalCost = data.reduce((sum, item) => sum + parseFloat(item['Total Cost']), 0);
    const sectorData = data.reduce((acc, item) => {
      const sector = item.Sector;
      const value = parseFloat(item['Total Cost']);
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});

    const pieChartData = Object.entries(sectorData).map(([name, value]) => ({
      name,
      value: Number(((value / totalCost) * 100).toFixed(2))
    }));
    setPortfolioData(pieChartData);

    const holdings = data.map(item => ({
      name: item['Asset Name'],
      symbol: item.Ticker,
      allocation: ((parseFloat(item['Total Cost']) / data.reduce((sum, d) => sum + parseFloat(d['Total Cost']), 0)) * 100).toFixed(2),
      performance: (((parseFloat(item['Current Price']) - parseFloat(item['Purchase Price'])) / parseFloat(item['Purchase Price'])) * 100).toFixed(2)
    }));
    setHoldingsData(holdings);
  };

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className={styles.holdingsTitle}>Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.holdings}>
            <h3 className={styles.holdingsTitle}>Holdings</h3>
            <ScrollArea className={styles.scrollArea}>
              {holdingsData.map((holding) => (
                <div key={holding.symbol} className={styles.holdingItem}>
                  <div className={styles.holdingInfo}>
                    <div className={styles.holdingName}>{holding.name}</div>
                    <div className={styles.holdingSymbol}>{holding.symbol}</div>
                  </div>
                  <div className={styles.holdingMetrics}>
                    <div className={styles.holdingAllocation}>{holding.allocation}%</div>
                    <div className={`${styles.holdingPerformance} ${parseFloat(holding.performance) >= 0 ? styles.positive : styles.negative}`}>
                      {holding.performance > 0 ? '+' : ''}{holding.performance}%
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}