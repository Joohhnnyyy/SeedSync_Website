import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Bug, Upload, Download, Share2, AlertTriangle, Sprout } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { cropVarieties, regions } from '@/lib/cropData';
import { apiUrl } from "../lib/utils";

const ResultSection = ({ title, text }: { title: string; text: string }) => {
  const renderLineWithBold = (lineContent: string) => {
    // Remove asterisks and clean up the text
    let cleanedContent = lineContent.replace(/\*/g, '');
    
    // Handle bold text patterns like **text** or *text*
    const boldRegex = /\*\*(.*?)\*\*/g;
    cleanedContent = cleanedContent.replace(boldRegex, '$1');
    
    // Handle italic patterns like *text*
    const italicRegex = /\*(.*?)\*/g;
    cleanedContent = cleanedContent.replace(italicRegex, '$1');
    
    // Split by common separators and format as bullet points
    const parts = cleanedContent.split(/[;:]/).filter(part => part.trim());
    
    if (parts.length > 1) {
      return (
        <div className="space-y-1">
          {parts.map((part, index) => {
            const trimmedPart = part.trim();
            if (!trimmedPart) return null;
            
            // Check if this part contains risk level indicators
            const riskMatch = trimmedPart.match(/(.*?)\s*\((High|Medium|Low)\s*Risk\)/);
            if (riskMatch) {
              const [, riskText, riskLevel] = riskMatch;
              const riskColor = riskLevel === 'High' ? 'text-red-600' : 
                               riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600';
              
              return (
                <div key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 mt-2 mr-3 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong className="font-semibold">{riskText.trim()}</strong>
                    <span className={`font-medium ${riskColor}`}> ({riskLevel} Risk)</span>
                  </span>
                </div>
              );
            }
            
            return (
              <div key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 mt-2 mr-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">{trimmedPart}</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    // If no separators found, check for risk level in the whole line
    const riskMatch = cleanedContent.match(/(.*?)\s*\((High|Medium|Low)\s*Risk\)/);
    if (riskMatch) {
      const [, riskText, riskLevel] = riskMatch;
      const riskColor = riskLevel === 'High' ? 'text-red-600' : 
                       riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600';
      
      return (
        <span className="text-gray-700">
          <strong className="font-semibold">{riskText.trim()}</strong>
          <span className={`font-medium ${riskColor}`}> ({riskLevel} Risk)</span>
        </span>
      );
    }
    
    return <span className="text-gray-700">{cleanedContent}</span>;
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
      <div className="text-gray-600 space-y-2">
        {text.split('\n').map((line, i) => {
          const cleanedLine = line.trim().replace(/^[-*]\s*/, '');
          if (!cleanedLine) return null;
          return (
            <div key={i} className="flex items-start">
              <span className="w-1.5 h-1.5 mt-2 mr-3 rounded-full bg-emerald-500 flex-shrink-0" />
              {renderLineWithBold(cleanedLine)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PestDiseasePredictionNew = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crop: '',
    cropVariety: '',
    region: '',
    season: '',
    soilType: '',
    nitrogen: 50,
    phosphorus: 25,
    potassium: 70,
    soilpH: 6.5,
    previousIssues: [] as string[],
    images: [] as File[],
  });

  const [result, setResult] = useState<{
    likelyPests: string;
    symptoms: string;
    preventiveMeasures: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cropOptions = Object.keys(cropVarieties);
  const soilTypes = ['Loamy', 'Sandy', 'Clayey', 'Silty', 'Black'];
  const seasonOptions = ['Kharif', 'Rabi', 'Zaid', 'Whole Year'];
  const pestDiseaseOptions = ['Aphids', 'Whiteflies', 'Leaf Blight', 'Root Rot', 'Powdery Mildew', 'Rust'];

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'crop') {
      setFormData(prev => ({ ...prev, crop: value, cropVariety: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof typeof prev] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...currentArray, value] };
      }
    });
  };

  const handleRemoveTag = (name: string, tagToRemove: string) => {
    setFormData(prev => ({ ...prev, [name]: (prev[name as keyof typeof prev] as string[]).filter(item => item !== tagToRemove) }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [name]: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      crop: formData.crop,
      crop_variety: formData.cropVariety,
      location: formData.region,
      season: formData.season,
      soil_type: formData.soilType,
      nitrogen: formData.nitrogen,
      phosphorus: formData.phosphorus,
      potassium: formData.potassium,
      soil_ph: formData.soilpH,
      previous_issues: formData.previousIssues.join(', ') || null
    };

    try {
      const response = await fetch(apiUrl('/api/pest-disease/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction API failed.");
      }

      const data = await response.json();
      setResult(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <Button variant="ghost" className="mb-6 flex items-center text-gray-600 hover:text-gray-900" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <Bug className="mx-auto h-16 w-16 text-red-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pest & Disease Prediction</h1>
          <p className="text-gray-600 text-lg">Analyze your field conditions to predict potential crop threats.</p>
        </motion.div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center"><Leaf className="mr-2" /> Input Parameters</CardTitle>
              <p className="text-gray-500 text-base mt-2">Provide details about your crop and field conditions.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                {/* Crop & Location */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4">Crop & Location</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="crop">Crop Type</Label>
                      <Select name="crop" onValueChange={(value) => handleSelectChange('crop', value)}>
                        <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                        <SelectContent>{cropOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropVariety">Crop Variety (Optional)</Label>
                      <Select 
                        name="cropVariety" 
                        onValueChange={(value) => handleSelectChange('cropVariety', value)}
                        value={formData.cropVariety}
                        disabled={!formData.crop}
                      >
                        <SelectTrigger><SelectValue placeholder="Select variety" /></SelectTrigger>
                        <SelectContent>
                          {(cropVarieties[formData.crop] || []).map(v => <SelectItem key={v} value={v.toLowerCase()}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region/Location</Label>
                      <Select name="region" onValueChange={(value) => handleSelectChange('region', value)}>
                        <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>
                          {regions.map(r => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Select name="season" onValueChange={(value) => handleSelectChange('season', value)}>
                        <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                        <SelectContent>{seasonOptions.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Soil & Nutrients */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-6">Soil & Nutrients</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="soilType">Soil Type</Label>
                      <Select name="soilType" onValueChange={(value) => handleSelectChange('soilType', value)}>
                        <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                        <SelectContent>{soilTypes.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nitrogen (N) - mg/kg: {formData.nitrogen}</Label>
                      <Slider value={[formData.nitrogen]} onValueChange={v => handleSliderChange('nitrogen', v)} min={0} max={200} step={1} className="[&_[data-radix-slider-thumb]]:bg-gray-200 [&_[data-radix-slider-thumb]]:rounded-full" />
                    </div>
                    <div>
                      <Label>Phosphorus (P) - mg/kg: {formData.phosphorus}</Label>
                      <Slider value={[formData.phosphorus]} onValueChange={v => handleSliderChange('phosphorus', v)} min={0} max={100} step={1} className="[&_[data-radix-slider-thumb]]:bg-gray-200 [&_[data-radix-slider-thumb]]:rounded-full" />
                    </div>
                    <div>
                      <Label>Potassium (K) - mg/kg: {formData.potassium}</Label>
                      <Slider value={[formData.potassium]} onValueChange={v => handleSliderChange('potassium', v)} min={0} max={150} step={1} className="[&_[data-radix-slider-thumb]]:bg-gray-200 [&_[data-radix-slider-thumb]]:rounded-full" />
                    </div>
                    <div>
                      <Label>Soil pH: {formData.soilpH}</Label>
                      <Slider value={[formData.soilpH]} onValueChange={v => handleSliderChange('soilpH', v)} min={0} max={14} step={0.1} className="[&_[data-radix-slider-thumb]]:bg-gray-200 [&_[data-radix-slider-thumb]]:rounded-full" />
                    </div>
                  </div>
                </div>

                {/* History */}
                <div>
                   <h2 className="text-lg font-semibold text-green-700 mb-4 mt-6">History</h2>
                   <div className="space-y-2">
                      <Label htmlFor="previousIssues">Previous Pest/Disease Issues (Optional)</Label>
                      <Select name="previousIssues" onValueChange={(value) => handleMultiSelectChange('previousIssues', value)}>
                        <SelectTrigger><SelectValue placeholder="Select past issues" /></SelectTrigger>
                        <SelectContent>{pestDiseaseOptions.map(p => <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.previousIssues.map(item => (
                          <span key={item} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <Bug className="h-4 w-4 mr-1.5" />
                            {item}
                            <button type="button" className="ml-2 text-gray-500 hover:text-red-500" onClick={() => handleRemoveTag('previousIssues', item)}>&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 pt-4">
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800 w-full md:w-auto" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Get Predictions'}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => navigate('/services')} className="w-full md:w-auto">
                    Back to Services
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Result Panel */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 min-h-[500px] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center"><Sprout className="mr-2" /> Prediction Results</CardTitle>
              <p className="text-gray-500 text-base mt-2">Potential risks and recommendations will appear here.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Analyzing data and making predictions...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                  <AlertTriangle className="h-16 w-16 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Analysis Failed</h2>
                  <p>{error}</p>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Leaf className="h-16 w-16 text-green-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No predictions yet</h2>
                  <p className="text-gray-500 text-center max-w-xs">
                    Enter your field data on the left to see potential risks.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <ResultSection title="Likely Pests or Diseases" text={result.likelyPests} />
                  <ResultSection title="Symptoms to Watch For" text={result.symptoms} />
                  <ResultSection title="Preventive Measures" text={result.preventiveMeasures} />
                  <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-start">
                    <Button variant="outline" size="sm" className="flex items-center"><Download className="mr-2 h-4 w-4" />Download Report</Button>
                    <Button variant="outline" size="sm" className="flex items-center"><Share2 className="mr-2 h-4 w-4" />Share Results</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PestDiseasePredictionNew; 