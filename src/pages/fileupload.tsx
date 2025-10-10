import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/services/supabaseClient' // NEW

interface UploadedFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

export default function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const navigate = useNavigate()

  // NEW: Protect with Supabase session (not localStorage)
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (!session) navigate('/auth', { replace: true })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/auth', { replace: true })
    })
    return () => {
      mounted = false
      sub.subscription?.unsubscribe()
    }
  }, [navigate])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [perplexityKey, setPerplexityKey] = useState('') // not sent now; kept in UI

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    newFiles.forEach((_, index) => {
      simulateUpload(uploadedFiles.length + index)
    })
  }, [uploadedFiles.length])

  const simulateUpload = (fileIndex: number) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const updated = [...prev]
        if (updated[fileIndex]) {
          updated[fileIndex].progress += 10
          if (updated[fileIndex].progress >= 100) {
            updated[fileIndex].status = 'completed'
            clearInterval(interval)
          }
        }
        return updated
      })
    }, 200)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: true
  })

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-destructive" />
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <Image className="w-8 h-8 text-success" />
      default:
        return <FileText className="w-8 h-8 text-muted-foreground" />
    }
  }

  // Call FastAPI /underwrite with multipart FormData
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)
    setError('')

    try {
      const files = uploadedFiles.filter(f => f.status === 'completed').map(f => f.file)
      if (files.length === 0) {
        throw new Error('Please upload at least one file')
      }

      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file, file.name)
      }
      // Optionally include overrides:
      // formData.append('overrides', JSON.stringify({ purchase_price: 1000000 }))

      // Do not set Content-Type manually; the browser sets the boundary
      // const response = await fetch('https://underwriting-at5l.onrender.com/underwrite', {
      //   method: 'POST',
      //   body: formData,
      // })
        const response = await fetch('https://acquire-underwriting1.onrender.com/underwrite', {
         method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Failed with status ${response.status}`)
      }

      const result = await response.json()
      // Persist for results page (ensure AnalysisResults reads the same key)
      sessionStorage.setItem('underwritingResult', JSON.stringify(result))

      // Navigate to results page
      navigate('/analysis-results')
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err?.message || 'Failed to analyze documents. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload Property Documents</h1>
            <p className="text-muted-foreground">
              Upload your offering memorandum, rent roll, or financial statements to begin AI analysis
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary hover:bg-primary/5'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <div className="text-sm text-muted-foreground">
                  Supports: PDF, Excel (.xlsx, .xls), CSV
                </div>
                <Button variant="outline" className="mt-4">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        {getFileIcon(fileObj.file.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {fileObj.file.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            {fileObj.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-success" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Progress value={fileObj.progress} className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {fileObj.progress}%
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {uploadedFiles.some(f => f.status === 'completed') && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="mb-4 space-y-2">
                      <Label htmlFor="perplexityKey">Perplexity API Key (optional)</Label>
                      <Input
                        id="perplexityKey"
                        type="password"
                        placeholder="Enter Perplexity API key"
                        value={perplexityKey}
                        onChange={(e) => setPerplexityKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Add your key for richer AI extraction; otherwise runs locally.</p>
                    </div>

                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Documents...
                        </>
                      ) : (
                        'Start AI Analysis'
                      )}
                    </Button>

                    {error && (
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
