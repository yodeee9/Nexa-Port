"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, FileText, AlertCircle, CheckCircle2, Shield, User, ChartCandlestick, Loader2} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import styles from './portfolio-upload.module.css'
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "./ui/label"


export default function PortfolioUploadComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [securityMode, setSecurityMode] = useState(false)
  const [investmentStrategy, setInvestmentStrategy] = useState("balanced")
  const [referenceInvestor, setReferenceInvestor] = useState("")
  const router = useRouter()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setError(null)
      parseCSV(selectedFile)
    } else {
      setFile(null)
      setError("Please select a valid CSV file.")
    }
  }

  const parseCSV = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim() !== "");
        const parsedData = lines.map(line => line.split(",").map(cell => cell.trim()));
        setPreview(parsedData.slice(0, 6));
        resolve(parsedData);
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const formatCSVData = (csvData: string[][]): PortfolioItem[] => {
    const [headers, ...rows] = csvData;
    
    return rows.map(row => {
      return headers.reduce((acc, header, index) => {
        acc[header.trim() as keyof PortfolioItem] = row[index].trim();
        return acc;
      }, {} as PortfolioItem);
    });
  };

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true)
      const formData = new FormData()
      try {
        const csvData = await parseCSV(file);
        const formattedData = formatCSVData(csvData);
        localStorage.setItem('parsedData', JSON.stringify(formattedData));
        formData.append('file', file)
        formData.append('securityMode', securityMode.toString())
        formData.append('investmentStrategy', investmentStrategy)
        formData.append('referenceInvestor', referenceInvestor)
        const response = await fetch('http://localhost:8080/analyze-portfolio', {
          method: 'POST',
          body: formData,
        })
        const result = await response.json()
        localStorage.setItem('analysisResult', JSON.stringify(result))
        setIsUploading(false)
        router.push("/portfolio-analysis")
      } catch (error) {
        console.error('Error uploading file:', error)
        setIsUploading(false)
        setError("An error occurred while analyzing the portfolio.")
      }
    }
  }
  
  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.motionDiv}
      >
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Upload Your Portfolio</CardTitle>
            <CardDescription className={styles.cardDescription}>
              Drag and drop your CSV file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <Label htmlFor="security-mode">Security Mode</Label>
                </div>
                <Switch
                  id="security-mode"
                  checked={securityMode}
                  onCheckedChange={setSecurityMode}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ChartCandlestick className="w-4 h-4" />
                  <Label htmlFor="investment-strategy">Investment Strategy</Label>
                </div>
                <Select
                  value={investmentStrategy}
                  onValueChange={setInvestmentStrategy}
                >
                  <SelectTrigger id="investment-strategy">
                    <SelectValue placeholder="Select your investment strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <Label htmlFor="reference-investor">Reference Investor (Optional)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="reference-investor"
                    placeholder="e.g., Warren Buffett"
                    value={referenceInvestor}
                    onChange={(e) => setReferenceInvestor(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.dropzone}>
                <label htmlFor="dropzone-file" className={styles.dropzoneLabel}>
                  <div className={styles.dropzoneContent}>
                    <Upload className={styles.uploadIcon} />
                    <p className={styles.dropzoneText}>
                      <span className={styles.dropzoneTextBold}>Click to upload</span> or drag and drop
                    </p>
                    <p className={styles.dropzoneSubtext}>CSV file (MAX. 10MB)</p>
                  </div>
                  <Input id="dropzone-file" type="file" accept=".csv" className={styles.hiddenInput} onChange={handleFileChange} />
                </label>
              </div>
              {error && (
                <Alert variant="destructive" className={styles.alert}>
                  <AlertCircle className={styles.alertIcon} />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {file && !error && (
                <Alert variant="default" className={styles.successAlert}>
                  <CheckCircle2 className={styles.successIcon} />
                  <AlertTitle>File selected</AlertTitle>
                  <AlertDescription>{file.name}</AlertDescription>
                </Alert>
              )}
              {preview.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className={styles.previewTitle}>Preview</h3>
                  <div className={styles.tableContainer}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {preview[0].map((header, index) => (
                            <TableHead key={index} className={styles.tableHead}>
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.slice(1).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {isUploading ? (
              <div className="w-full flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span className="text-lg font-semibold">Uploading and Analyzing...</span>
                </div>
                <p className="text-sm text-muted-foreground">This may take a few moments. Please wait.</p>
              </div>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={!file}
                className={styles.uploadButton}
              >
                  <Upload className={styles.buttonIcon} /> Upload and Analyze
            </Button>
          )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}