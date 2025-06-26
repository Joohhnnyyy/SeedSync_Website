import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, Leaf, Thermometer, Droplet, CloudRain, LandPlot, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { apiUrl } from "../lib/utils";

// Import fertilizer images
import defaultFertilizer from '@/assets/fertilizers/default.png';
import urea from '@/assets/fertilizers/Urea.png';
import tsp from '@/assets/fertilizers/TSP.png';
import superphosphate from '@/assets/fertilizers/Superphosphate.png';
import potassiumSulfate from '@/assets/fertilizers/Potassium sulfate.png';
import potassiumChloride from '@/assets/fertilizers/Potassium chloride.png';
import dap from '@/assets/fertilizers/DAP.png';
import fertilizer2828 from '@/assets/fertilizers/28-28.png';
import fertilizer2020 from '@/assets/fertilizers/20-20.png';
import fertilizer171717 from '@/assets/fertilizers/17-17-17.png';
import fertilizer151515 from '@/assets/fertilizers/15-15-15.png';
import fertilizer143514 from '@/assets/fertilizers/14-35-14.png';
import fertilizer141414 from '@/assets/fertilizers/14-14-14.png';
import fertilizer102626 from '@/assets/fertilizers/10-26-26.png';
import fertilizer101010 from '@/assets/fertilizers/10-10-10.png';

// Create a mapping of fertilizer names to their images
const fertilizerImages: { [key: string]: string } = {
  'Urea': urea,
  'TSP': tsp,
  'Superphosphate': superphosphate,
  'Potassium sulfate': potassiumSulfate,
  'Potassium chloride': potassiumChloride,
  'DAP': dap,
  '28-28': fertilizer2828,
  '20-20': fertilizer2020,
  '17-17-17': fertilizer171717,
  '15-15-15': fertilizer151515,
  '14-35-14': fertilizer143514,
  '14-14-14': fertilizer141414,
  '10-26-26': fertilizer102626,
  '10-10-10': fertilizer101010,
};

const FertilizerRecommendation = () => {
  const navigate = useNavigate();
  
  // Add crop type mapping
  const cropTypeMap: { [key: string]: number } = {
    'barley': 0,
    'cotton': 1,
    'groundnuts': 2,
    'maizemillets': 3,
    'oilseeds': 4,
    'paddy': 5,
    'pulses': 6,
    'sugarcane': 7,
    'tobacco': 8,
    'wheat': 9,
    'coffee': 10,
    'kidneybeans': 11,
    'orange': 12,
    'pomegranate': 13,
    'rice': 14,
    'watermelon': 15
  };

  const [formData, setFormData] = useState({
    cropType: 'wheat',
    nitrogen: 50,
    phosphorus: 25,
    potassium: 70,
    temperature: 25,
    moisture: 60,
    humidity: 80,
    soilType: '0', // Corresponds to Loamy
  });
  const [result, setResult] = useState<{
    fertilizer: string;
    confidence: number;
    description: string;
    tips: string;
    geminiTip?: string;
    note?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0],
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.cropType || !formData.soilType) {
        throw new Error('Please select both crop type and soil type');
      }

      const response = await fetch(apiUrl('/api/fertilizer/predict'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature.toString()),
          humidity: parseFloat(formData.humidity.toString()),
          moisture: parseFloat(formData.moisture.toString()),
          soil_type: parseInt(formData.soilType),
          crop_type: cropTypeMap[formData.cropType],
          nitrogen: parseFloat(formData.nitrogen.toString()),
          potassium: parseFloat(formData.potassium.toString()),
          phosphorous: parseFloat(formData.phosphorus.toString()),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed'); // Will be caught and will trigger mock
      }

      const data = await response.json();
      setResult({
        fertilizer: data.recommended_fertilizer,
        confidence: data.confidence,
        description: data.description,
        tips: data.tips,
        geminiTip: data.gemini_tip,
        note: data.note,
      });
    } catch (err) {
      console.warn("API call failed, using mock data for fertilizer recommendation.", err);
      // Mock response
      const mockFertilizers = Object.keys(fertilizerImages);
      const randomFertilizer = mockFertilizers[Math.floor(Math.random() * mockFertilizers.length)];
      setResult({
        fertilizer: randomFertilizer,
        confidence: Math.random() * (0.98 - 0.85) + 0.85,
        description: `A mock description for ${randomFertilizer}. It is a balanced fertilizer suitable for a wide range of crops and soil types.`,
        tips: "Apply as per the recommended dosage during the appropriate growth stage of the crop. Ensure even distribution and mix well with the soil.",
        note: "This is a mock recommendation for UI testing as the backend is not running."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <Button
            variant="ghost"
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <FlaskConical className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fertilizer Recommendation</h1>
          <p className="text-gray-600 text-lg">Get personalized fertilizer suggestions for optimal crop nutrition</p>
        </motion.div>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Leaf className="mr-2" /> Soil & Climate Information
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Fill in your field's details for a smart fertilizer suggestion.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Soil Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-2">Soil Information</h2>
                  <div className="mb-6">
                    <Label htmlFor="cropType" className="font-semibold">Crop Type</Label>
                    <Select name="cropType" onValueChange={(value) => handleSelectChange('cropType', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barley">Barley</SelectItem>
                        <SelectItem value="cotton">Cotton</SelectItem>
                        <SelectItem value="groundnuts">Ground Nuts</SelectItem>
                        <SelectItem value="maizemillets">MaizeMillets</SelectItem>
                        <SelectItem value="oilseeds">Oil seeds</SelectItem>
                        <SelectItem value="paddy">Paddy</SelectItem>
                        <SelectItem value="pulses">Pulses</SelectItem>
                        <SelectItem value="sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="tobacco">Tobacco</SelectItem>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="coffee">Coffee</SelectItem>
                        <SelectItem value="kidneybeans">Kidney Beans</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="pomegranate">Pomegranate</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="watermelon">Watermelon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="soilType" className="font-semibold">Soil Type</Label>
                    <Select name="soilType" onValueChange={(value) => handleSelectChange('soilType', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Loamy</SelectItem>
                        <SelectItem value="1">Sandy</SelectItem>
                        <SelectItem value="2">Clayey</SelectItem>
                        <SelectItem value="3">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="nitrogen">Nitrogen (N): {formData.nitrogen} mg/kg</Label>
                    <Slider
                      value={[formData.nitrogen]}
                      onValueChange={value => handleSliderChange('nitrogen', value)}
                      min={0}
                      max={176}
                      step={1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="phosphorus">Phosphorus (P): {formData.phosphorus} mg/kg</Label>
                    <Slider
                      value={[formData.phosphorus]}
                      onValueChange={value => handleSliderChange('phosphorus', value)}
                      min={0}
                      max={104}
                      step={1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="potassium">Potassium (K): {formData.potassium} mg/kg</Label>
                    <Slider
                      value={[formData.potassium]}
                      onValueChange={value => handleSliderChange('potassium', value)}
                      min={0}
                      max={109}
                      step={1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                </div>
                {/* Climate Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-8">Climate Information</h2>
                  <div className="mb-6">
                    <Label htmlFor="temperature">Temperature (°C): {formData.temperature}</Label>
                    <Slider
                      value={[formData.temperature]}
                      onValueChange={value => handleSliderChange('temperature', value)}
                      min={0}
                      max={38}
                      step={0.1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="moisture">Moisture (%): {formData.moisture}</Label>
                    <Slider
                      value={[formData.moisture]}
                      onValueChange={value => handleSliderChange('moisture', value)}
                      min={25}
                      max={115}
                      step={0.1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="humidity">Humidity (%): {formData.humidity}</Label>
                    <Slider
                      value={[formData.humidity]}
                      onValueChange={value => handleSliderChange('humidity', value)}
                      min={50}
                      max={145}
                      step={0.1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-6">
                  <Button 
                    type="submit" 
                    className="bg-black text-white hover:bg-gray-800 w-full md:w-auto"
                    disabled={loading}
                  >
                    {loading ? 'Getting Recommendation...' : 'Get Fertilizer Recommendation'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={() => navigate('/services')}
                  >
                    Back to Services
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* Right: Result Panel */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 min-h-[500px] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <FlaskConical className="mr-2" /> Fertilizer Recommendation
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Your personalized fertilizer recommendation will appear here.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Getting your recommendation...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                  <h2 className="text-2xl font-semibold mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Leaf className="h-16 w-16 text-green-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No recommendation yet</h2>
                  <p className="text-gray-500 text-center max-w-xs">
                    Enter your soil and climate data on the left and click <span className="font-semibold">Get Fertilizer Recommendation</span> to see the best fertilizer for your field!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {result.note && (
                    <div className="w-full bg-white border-l-4 border-gray-200 text-gray-700 p-4 mb-6 rounded-r-lg" role="alert">
                      <p className="font-bold">Developer Note</p>
                      <p>{result.note}</p>
                    </div>
                  )}
                  <div className="relative w-72 h-96 mb-8 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <img 
                      src={fertilizerImages[result.fertilizer] || defaultFertilizer} 
                      alt={result.fertilizer}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
                    />
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                      {Math.round(result.confidence * 100)}% Confidence
                    </div>
                  </div>
                  <div className="w-full space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">{result.fertilizer}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{result.description}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Usage Tips</h4>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="text-gray-600 leading-relaxed">{result.tips}</p>
                        </div>
                      </div>
                    </div>
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

export default FertilizerRecommendation; 