import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCw, Leaf, Thermometer, CloudRain, Droplet, Sprout, Bug, Target, Info, Download, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiUrl } from "../lib/utils";

const CropRotationPlanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentCrop: '',
    previousCrops: [] as string[],
    soilType: '',
    nitrogen: 50,
    phosphorus: 25,
    potassium: 70,
    soilpH: 6.5,
    climateZone: '',
    season: '',
    waterAvailability: '',
    irrigationType: '',
    pestDiseaseHistory: [] as string[],
    targetGoal: '',
  });
  const [recommendation, setRecommendation] = useState<{ nextCrop: string; justification: string; advantages: string[]; rotationPlan?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [sliderActive, setSliderActive] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentArray = (prev as any)[name] as string[];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value),
        };
      } else {
        return {
          ...prev,
          [name]: [...currentArray, value],
        };
      }
    });
  };

  const handleRemoveTag = (name: string, tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: (prev as any)[name].filter((item: string) => item !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch(apiUrl('/api/rotation/generate-advice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate recommendation.');
      }

      const data = await response.json();
      setRecommendation(data);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const cropOptions = ['Wheat', 'Rice', 'Maize', 'Barley', 'Pulses', 'Mustard', 'Soybean', 'Cotton'];
  const soilOptions = ['Clay', 'Loamy', 'Sandy', 'Silty'];
  const climateOptions = ['Tropical', 'Temperate', 'Arid', 'Subtropical', 'Mediterranean'];
  const seasonOptions = ['Kharif', 'Rabi', 'Zaid'];
  const waterAvailabilityOptions = ['High', 'Medium', 'Low'];
  const irrigationTypeOptions = ['Drip', 'Flood', 'Sprinkler', 'None'];
  const pestDiseaseOptions = ['Fungal Infection', 'Pest Attacks', 'Bacterial Blight', 'Rust', 'Nematodes', 'None'];
  const targetGoalOptions = [
    { value: 'maximize_yield', label: 'Maximize Yield' },
    { value: 'improve_soil_health', label: 'Improve Soil Health' },
    { value: 'minimize_pest_risk', label: 'Minimize Pest Risk' },
    { value: 'match_market_demand', label: 'Match Market Demand' },
    { value: 'water_conservation', label: 'Water Conservation' },
  ];

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
          <RotateCw className="mx-auto h-16 w-16 text-emerald-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crop Rotation Planner</h1>
          <p className="text-gray-600 text-lg">Plan your crop rotations for sustainable farming and improved productivity.</p>
        </motion.div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="shadow-xl rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Leaf className="mr-2" /> Rotation Parameters
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Fill in your field's details for a smart rotation plan.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                {/* Section 1: Previous Crop History */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4">Crop History</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentCrop">Current Crop</Label>
                      <Select name="currentCrop" onValueChange={(value) => handleSelectChange('currentCrop', value)} value={formData.currentCrop}>
                        <SelectTrigger className={`w-full ${focusedField === 'currentCrop' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('currentCrop')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select current crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropOptions.map(crop => <SelectItem key={crop} value={crop.toLowerCase()}>{crop}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousCrops">Previous Crop(s)</Label>
                      <Select name="previousCrops" onValueChange={(value) => handleMultiSelectChange('previousCrops', value)}>
                        <SelectTrigger className={`w-full ${focusedField === 'previousCrops' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('previousCrops')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select previous crop(s)" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropOptions.map(crop => (
                            <SelectItem key={crop} value={crop.toLowerCase()}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.previousCrops.map(crop => (
                          <span key={crop} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <Leaf className="h-4 w-4 mr-1.5" />
                            {crop}
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-red-500"
                              onClick={() => handleRemoveTag('previousCrops', crop)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Soil and Field Details */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-6">Soil, Climate & Water</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="soilType">Soil Type</Label>
                      <Select name="soilType" onValueChange={(value) => handleSelectChange('soilType', value)} value={formData.soilType}>
                        <SelectTrigger className={`w-full ${focusedField === 'soilType' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('soilType')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          {soilOptions.map(type => <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="climateZone">Climate Zone</Label>
                      <Select name="climateZone" onValueChange={(value) => handleSelectChange('climateZone', value)} value={formData.climateZone}>
                        <SelectTrigger className={`w-full ${focusedField === 'climateZone' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('climateZone')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select climate zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {climateOptions.map(zone => <SelectItem key={zone} value={zone.toLowerCase()}>{zone}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Select name="season" onValueChange={(value) => handleSelectChange('season', value)} value={formData.season}>
                        <SelectTrigger className={`w-full ${focusedField === 'season' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('season')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasonOptions.map(season => <SelectItem key={season} value={season.toLowerCase()}>{season}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waterAvailability">Water Availability</Label>
                      <Select name="waterAvailability" onValueChange={(value) => handleSelectChange('waterAvailability', value)} value={formData.waterAvailability}>
                        <SelectTrigger className={`w-full ${focusedField === 'waterAvailability' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('waterAvailability')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select water availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {waterAvailabilityOptions.map(water => <SelectItem key={water} value={water.toLowerCase()}>{water}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Nutrient Levels */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-6">Nutrient Levels</h2>
                  <div className="space-y-6">
                    <div>
                      <Label>Nitrogen (N) - mg/kg: {formData.nitrogen}</Label>
                      <Slider value={[formData.nitrogen]} onValueChange={val => setFormData(prev => ({ ...prev, nitrogen: val[0] }))} min={0} max={200} step={1} className={`[&>span:first-child]:bg-gray-200 ${sliderActive === 'nitrogen' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                        onPointerDown={() => setSliderActive('nitrogen')}
                        onPointerUp={() => setSliderActive(null)}
                        onBlur={() => setSliderActive(null)}>
                      </Slider>
                    </div>
                    <div>
                      <Label>Phosphorus (P) - mg/kg: {formData.phosphorus}</Label>
                      <Slider value={[formData.phosphorus]} onValueChange={val => setFormData(prev => ({ ...prev, phosphorus: val[0] }))} min={0} max={100} step={1} className={`[&>span:first-child]:bg-gray-200 ${sliderActive === 'phosphorus' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                        onPointerDown={() => setSliderActive('phosphorus')}
                        onPointerUp={() => setSliderActive(null)}
                        onBlur={() => setSliderActive(null)}>
                      </Slider>
                    </div>
                    <div>
                      <Label>Potassium (K) - mg/kg: {formData.potassium}</Label>
                      <Slider value={[formData.potassium]} onValueChange={val => setFormData(prev => ({ ...prev, potassium: val[0] }))} min={0} max={150} step={1} className={`[&>span:first-child]:bg-gray-200 ${sliderActive === 'potassium' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                        onPointerDown={() => setSliderActive('potassium')}
                        onPointerUp={() => setSliderActive(null)}
                        onBlur={() => setSliderActive(null)}>
                      </Slider>
                    </div>
                    <div>
                      <Label>Soil pH: {formData.soilpH}</Label>
                      <Slider value={[formData.soilpH]} onValueChange={val => setFormData(prev => ({ ...prev, soilpH: val[0] }))} min={0} max={14} step={0.1} className={`[&>span:first-child]:bg-gray-200 ${sliderActive === 'soilpH' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                        onPointerDown={() => setSliderActive('soilpH')}
                        onPointerUp={() => setSliderActive(null)}
                        onBlur={() => setSliderActive(null)}>
                      </Slider>
                    </div>
                  </div>
                </div>

                {/* Section 4: Pest History & Goals */}
                <div>
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-6">History & Goals</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="pestDiseaseHistory">Pest or Disease History (Optional)</Label>
                      <Select name="pestDiseaseHistory" onValueChange={(value) => handleMultiSelectChange('pestDiseaseHistory', value)}>
                        <SelectTrigger className={`w-full ${focusedField === 'pestDiseaseHistory' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                          onFocus={() => setFocusedField('pestDiseaseHistory')} onBlur={() => setFocusedField(null)}>
                          <SelectValue placeholder="Select history (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {pestDiseaseOptions.map(history => (
                            <SelectItem key={history} value={history.toLowerCase()}>
                              {history}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.pestDiseaseHistory.map(item => (
                          <span key={item} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <Bug className="h-4 w-4 mr-1.5" />
                            {item}
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-red-500"
                              onClick={() => handleRemoveTag('pestDiseaseHistory', item)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetGoal">Primary Farming Goal</Label>
                      <ToggleGroup type="single" value={formData.targetGoal} onValueChange={(value: string) => handleSelectChange('targetGoal', value)} className="flex flex-wrap justify-start gap-2">
                        {targetGoalOptions.map(goal => (
                          <ToggleGroupItem
                            key={goal.value}
                            value={goal.value}
                            aria-label={goal.label}
                            className="bg-white border border-gray-300 text-gray-700 data-[state=on]:bg-black data-[state=on]:text-white hover:bg-gray-100 transition-colors"
                          >
                            {goal.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 pt-4">
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800 w-full md:w-auto" disabled={loading}>
                    {loading ? 'Generating Plan...' : 'Generate Rotation Plan'}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => navigate('/services')} className="w-full md:w-auto">
                    Back to Services
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Result Panel */}
          <Card className="shadow-xl rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Sprout className="mr-2" /> Rotation Recommendation
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Your personalized rotation plan will appear here.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Generating your rotation plan...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                  <h2 className="text-2xl font-semibold mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              ) : !recommendation ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Leaf className="h-16 w-16 text-green-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No recommendation yet</h2>
                  <p className="text-gray-500 text-center max-w-xs">
                    Enter your field data on the left and click <span className="font-semibold">Generate Rotation Plan</span> to see a suggestion.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500">Recommended Next Crop</h3>
                    <p className="text-3xl font-bold text-emerald-600">{recommendation.nextCrop}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Justification</h4>
                    <p className="text-gray-600">{recommendation.justification}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Key Advantages</h4>
                    <ul className="space-y-2">
                      {recommendation.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 mr-3 rounded-full bg-emerald-500"></div>
                          <span className="text-gray-700">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.rotationPlan && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Suggested 3-Season Plan</h4>
                       <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">                  
                        {recommendation.rotationPlan.map((step, index) => (
                          <li key={index} className="mb-6 ml-4">
                            <div className="absolute w-3 h-3 bg-gray-300 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">Season {index + 1}</time>
                            <h3 className="text-lg font-semibold text-gray-900">{step}</h3>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-start">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center"><Info className="mr-2 h-4 w-4" />Details</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Justification for {recommendation.nextCrop}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                          <p>{recommendation.justification}</p>
                          <h4 className="text-lg font-semibold">Detailed Advantages:</h4>
                          <ul className="list-disc list-inside ml-4">
                            {recommendation.advantages.map((advantage, index) => (
                              <li key={index}>{advantage}</li>
                            ))}
                          </ul>
                          {recommendation.rotationPlan && (
                            <div>
                              <h4 className="text-lg font-semibold">Rotation Plan Context:</h4>
                              <p className="text-sm text-gray-600">This plan ensures diversity and long-term soil health.</p>
                              <ul className="list-disc list-inside ml-4 mt-2">
                                {recommendation.rotationPlan.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="flex items-center"><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button variant="outline" size="sm" className="flex items-center"><Mail className="mr-2 h-4 w-4" />Email</Button>
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

export default CropRotationPlanner; 