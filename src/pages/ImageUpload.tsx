import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf,
  RefreshCw,
  AlertCircle,
  History,
  Crop,
  Database,
  Shield,
  Zap,
  Info,
  Lightbulb,
  CheckCircle,
  AlertOctagon,
  AlertCircle as AlertCircleIcon,
  Video,
  VideoOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiUrl } from "../lib/utils";

const ImageUpload = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper functions to extract and format sections from Gemini response
  const formatGeminiText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*\*\s+/gm, '• ') // Convert asterisks to bullet points
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  const extractImmediateActionsSection = (text: string) => {
    const sections = text.split(/\d+\.\s+/);
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].toLowerCase().includes('immediate action')) {
        return formatGeminiText(sections[i]);
      }
    }
    return formatGeminiText(text);
  };

  const extractTreatmentsSection = (text: string) => {
    const sections = text.split(/\d+\.\s+/);
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].toLowerCase().includes('treatment')) {
        return formatGeminiText(sections[i]);
      }
    }
    return formatGeminiText(text);
  };

  const extractPreventiveMeasuresSection = (text: string) => {
    const sections = text.split(/\d+\.\s+/);
    for (let i = 1; i < sections.length; i++) {
      if (sections[i].toLowerCase().includes('prevention') || sections[i].toLowerCase().includes('long-term')) {
        return formatGeminiText(sections[i]);
      }
    }
    return formatGeminiText(text);
  };

  const formatBulletPoints = (text: string) => {
    return text
      .replace(/^\s*\*\s+/gm, '• ') // Convert asterisks to bullet points
      .replace(/^\s*-\s+/gm, '• ') // Convert dashes to bullet points
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  // Helper functions for severity and tag styling
  const getSeverityLevel = (confidence: number, issue: string) => {
    const isHealthy = issue.toLowerCase().includes('healthy');
    
    if (isHealthy) {
      return 'Healthy';
    }
    
    if (confidence >= 90) return 'Critical';
    if (confidence >= 75) return 'High';
    if (confidence >= 60) return 'Medium';
    if (confidence >= 40) return 'Low';
    return 'Minimal';
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertOctagon
        };
      case 'High':
        return {
          variant: 'destructive' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle
        };
      case 'Medium':
        return {
          variant: 'secondary' as const,
          className: 'bg-white text-gray-800 border-gray-200',
          icon: Zap
        };
      case 'Low':
        return {
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Info
        };
      case 'Minimal':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Lightbulb
        };
      case 'Healthy':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircleIcon
        };
    }
  };

  const getPredictionType = (issue: string) => {
    const lowerIssue = issue.toLowerCase();
    
    if (lowerIssue.includes('healthy')) return 'Healthy Crop';
    if (lowerIssue.includes('rust')) return 'Fungal Disease';
    if (lowerIssue.includes('blight')) return 'Bacterial Disease';
    if (lowerIssue.includes('mildew')) return 'Fungal Disease';
    if (lowerIssue.includes('spot')) return 'Fungal Disease';
    if (lowerIssue.includes('rot')) return 'Fungal Disease';
    if (lowerIssue.includes('virus')) return 'Viral Disease';
    if (lowerIssue.includes('pest')) return 'Pest Infestation';
    if (lowerIssue.includes('deficiency')) return 'Nutrient Deficiency';
    if (lowerIssue.includes('stress')) return 'Environmental Stress';
    
    return 'Plant Issue';
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
            setImage(file);
            setPreview(URL.createObjectURL(blob));
            setActiveTab("preview");
            setIsCameraActive(false); // Triggers useEffect cleanup
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };
  
  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraStream(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not start camera. Please check your browser permissions.");
        setIsCameraActive(false); // Reset state on error
      }
    };

    const disableCamera = () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };

    if (isCameraActive) {
      enableCamera();
    } else {
      disableCamera();
    }

    return () => {
      disableCamera(); // Cleanup on component unmount
    };
  }, [isCameraActive]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setActiveTab("preview");
      };
      reader.readAsDataURL(file);
    }
  }, [setActiveTab]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log('Starting image analysis...', image);
      const formData = new FormData();
      formData.append('file', image);
      console.log('FormData created with file:', image.name, image.size);

      const response = await fetch(apiUrl('/api/disease/predict_disease'), {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      // Transform the API response to match our UI structure
      const severity = getSeverityLevel(result.confidence, result.predicted_disease);
      
      setAnalysisResult({
        cropType: 'Crop', // The API doesn't return crop type, so we'll use a default
        issue: result.predicted_disease,
        confidence: result.confidence,
        severity: severity,
        predictionType: getPredictionType(result.predicted_disease),
        recommendations: {
          diseaseInfo: result.prevention_tips,
          structuredInfo: result.structured_info,
          immediateActions: result.structured_info?.immediate_actions || [
            'Remove and destroy infected plant parts',
            'Isolate affected plants',
            'Avoid overhead watering'
          ],
          treatments: result.structured_info?.chemical_controls || [
            'Apply appropriate fungicides or pesticides',
            'Use biological control methods',
            'Implement proper crop management practices'
          ],
          preventiveMeasures: [
            ...(result.structured_info?.cultural_practices || []),
            ...(result.structured_info?.monitoring || []),
            ...(result.structured_info?.resistant_varieties || [])
          ]
        }
      });
      
      setActiveTab("results");
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Handle error - you might want to show an error message to the user
      setAnalysisResult({
        cropType: 'Unknown',
        issue: 'Analysis Failed',
        confidence: 0,
        severity: 'Unknown',
        predictionType: 'Unknown',
        recommendations: {
          diseaseInfo: 'Unable to analyze the image. Please try again with a clearer image.',
          immediateActions: ['Try uploading a different image'],
          treatments: ['Contact support if the problem persists'],
          preventiveMeasures: ['Ensure good image quality and lighting']
        }
      });
      setActiveTab("results");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setAnalysisResult(null);
    setActiveTab("upload");
    setIsCameraActive(false); // Also turn off camera on reset
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Page Header */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mr-0 sm:mr-4 self-start sm:self-auto"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Visual Crop Analysis</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Upload a photo of your crop to detect diseases, pests, or deficiencies instantly
                </p>
                <p className="text-xs sm:text-sm text-blue-600 mt-1">
                  Get AI-powered insights within seconds
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <History className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload History</span>
                <span className="sm:hidden">History</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Database className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Disease Database</span>
                <span className="sm:hidden">Database</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="preview" disabled={!preview}>Preview</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Upload or Capture Image</CardTitle>
                <CardDescription>
                  Upload a file or use your camera to get an analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCameraActive ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 sm:h-96 object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
                        <div className="flex justify-between items-start">
                          <div className="bg-black bg-opacity-50 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                            <p className="text-xs sm:text-sm font-medium">Live Camera</p>
                          </div>
                          <Button onClick={() => setIsCameraActive(false)} variant="destructive" size="sm" className="text-xs sm:text-sm">
                            <VideoOff className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Stop Camera</span>
                            <span className="sm:hidden">Stop</span>
                          </Button>
                        </div>
                        <div className="flex justify-center">
                          <Button
                            onClick={capturePhoto}
                            size="lg"
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white text-black hover:bg-gray-100 shadow-lg"
                          >
                            <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col items-center space-y-4 mb-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsCameraActive(true)}
                        className="w-full md:w-auto"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Use Camera to Capture Image
                      </Button>
                    </div>
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or upload a file
                        </span>
                      </div>
                    </div>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">or click to select a file</p>
                      <p className="text-xs text-gray-400">Supported formats: JPG, PNG (max 5MB)</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="shadow-lg bg-white">
              <CardHeader>
                <CardTitle>Preview & Confirm</CardTitle>
                <CardDescription>
                  Review your image before analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      className="flex-1 w-full sm:w-auto"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Image'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 w-full sm:w-auto"
                      onClick={handleReset}
                    >
                      Try Another Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <AnimatePresence>
              {isAnalyzing ? (
                <Card className="shadow-lg bg-white">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
                      <h3 className="text-lg font-medium mb-2">Analyzing Image</h3>
                      <p className="text-gray-500">Please wait while we process your image...</p>
                      <Progress value={75} className="mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="shadow-lg bg-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Analysis Results</CardTitle>
                          <CardDescription>
                            Detected {analysisResult?.cropType} with {analysisResult?.issue}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          {analysisResult?.predictionType && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {analysisResult.predictionType}
                            </Badge>
                          )}
                          {analysisResult?.severity && (
                            (() => {
                              const config = getSeverityConfig(analysisResult.severity);
                              const IconComponent = config.icon;
                              return (
                                <Badge
                                  variant={config.variant}
                                  className={`${config.className} flex items-center`}
                                >
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {analysisResult.severity} Severity
                                </Badge>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Leaf className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">Crop Type:</span>
                        </div>
                        <span>{analysisResult?.cropType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="font-medium">Detected Issue:</span>
                        </div>
                        <span>{analysisResult?.issue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">Confidence:</span>
                        </div>
                        <span>{analysisResult?.confidence}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg bg-white">
                    <CardHeader>
                      <CardTitle>Disease Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult?.recommendations.structuredInfo ? (
                        <div className="space-y-6">
                          {/* Overview */}
                          {analysisResult.recommendations.structuredInfo.overview && (
                            <div>
                              <h4 className="font-semibold mb-2 text-gray-900">Overview</h4>
                              <p className="text-gray-600">{analysisResult.recommendations.structuredInfo.overview}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <div 
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: formatBulletPoints(analysisResult?.recommendations.diseaseInfo || '')
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg bg-white">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          Immediate Actions
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {analysisResult?.recommendations.immediateActions.map((action: string, index: number) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                        {/* Add detailed Gemini response for immediate actions */}
                        {analysisResult?.recommendations.diseaseInfo && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <h5 className="font-medium text-red-800 mb-2">Detailed Guidance:</h5>
                            <div 
                              className="text-sm text-red-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatBulletPoints(extractImmediateActionsSection(analysisResult.recommendations.diseaseInfo))
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Leaf className="h-4 w-4 text-green-500 mr-2" />
                          Suggested Treatments
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {analysisResult?.recommendations.treatments.map((treatment: string, index: number) => (
                            <li key={index}>{treatment}</li>
                          ))}
                        </ul>
                        {/* Add detailed Gemini response for treatments */}
                        {analysisResult?.recommendations.diseaseInfo && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h5 className="font-medium text-green-800 mb-2">Detailed Guidance:</h5>
                            <div 
                              className="text-sm text-green-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatBulletPoints(extractTreatmentsSection(analysisResult.recommendations.diseaseInfo))
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2" />
                          Preventive Measures
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {analysisResult?.recommendations.preventiveMeasures.map((measure: string, index: number) => (
                            <li key={index}>{measure}</li>
                          ))}
                        </ul>
                        {/* Add detailed Gemini response for preventive measures */}
                        {analysisResult?.recommendations.diseaseInfo && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-800 mb-2">Detailed Guidance:</h5>
                            <div 
                              className="text-sm text-blue-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatBulletPoints(extractPreventiveMeasuresSection(analysisResult.recommendations.diseaseInfo))
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleReset}
                    >
                      Try Another Image
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/report-issue', { 
                        state: { 
                          analysisData: analysisResult 
                        } 
                      })}
                    >
                      Report Issue
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ImageUpload; 