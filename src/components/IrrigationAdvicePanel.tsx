// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, ArrowLeft, Calendar, Cloud, Thermometer, Wind, Info, Clock, ChevronDown, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getWeatherData } from '@/utils/getWeather';
import { getIrrigationAdviceFromGemini } from '../services/getIrrigationAdviceFromGemini';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const locations = [
  // North India
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Noida', label: 'Noida' },
  { value: 'Gurgaon', label: 'Gurgaon' },
  { value: 'Lucknow', label: 'Lucknow' },
  { value: 'Kanpur', label: 'Kanpur' },
  { value: 'Agra', label: 'Agra' },
  { value: 'Varanasi', label: 'Varanasi' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Amritsar', label: 'Amritsar' },
  { value: 'Jaipur', label: 'Jaipur' },
  { value: 'Jodhpur', label: 'Jodhpur' },
  { value: 'Udaipur', label: 'Udaipur' },
  { value: 'Dehradun', label: 'Dehradun' },
  { value: 'Shimla', label: 'Shimla' },
  { value: 'Aligarh', label: 'Aligarh' },
  { value: 'Meerut', label: 'Meerut' },
  { value: 'Moradabad', label: 'Moradabad' },
  { value: 'Bareilly', label: 'Bareilly' },
  { value: 'Ghaziabad', label: 'Ghaziabad' },
  { value: 'Haridwar', label: 'Haridwar' },
  { value: 'Mathura', label: 'Mathura' },
  { value: 'Roorkee', label: 'Roorkee' },
  { value: 'Saharanpur', label: 'Saharanpur' },
  { value: 'Karnal', label: 'Karnal' },
  { value: 'Kurukshetra', label: 'Kurukshetra' },
  { value: 'Panipat', label: 'Panipat' },
  { value: 'Ambala', label: 'Ambala' },
  { value: 'Hisar', label: 'Hisar' },
  { value: 'Sonipat', label: 'Sonipat' },
  // South India
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Kochi', label: 'Kochi' },
  { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Vijayawada', label: 'Vijayawada' },
  { value: 'Visakhapatnam', label: 'Visakhapatnam' },
  { value: 'Tirupati', label: 'Tirupati' },
  { value: 'Warangal', label: 'Warangal' },
  { value: 'Guntur', label: 'Guntur' },
  { value: 'Hubli', label: 'Hubli' },
  { value: 'Belgaum', label: 'Belgaum' },
  { value: 'Davangere', label: 'Davangere' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Salem', label: 'Salem' },
  { value: 'Erode', label: 'Erode' },
  { value: 'Tirunelveli', label: 'Tirunelveli' },
  // West India
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Surat', label: 'Surat' },
  { value: 'Vadodara', label: 'Vadodara' },
  { value: 'Nagpur', label: 'Nagpur' },
  { value: 'Nashik', label: 'Nashik' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Rajkot', label: 'Rajkot' },
  { value: 'Bhavnagar', label: 'Bhavnagar' },
  { value: 'Jamnagar', label: 'Jamnagar' },
  { value: 'Solapur', label: 'Solapur' },
  { value: 'Kolhapur', label: 'Kolhapur' },
  { value: 'Aurangabad', label: 'Aurangabad' },
  { value: 'Sangli', label: 'Sangli' },
  { value: 'Akola', label: 'Akola' },
  { value: 'Amravati', label: 'Amravati' },
  // East India
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Bhubaneswar', label: 'Bhubaneswar' },
  { value: 'Patna', label: 'Patna' },
  { value: 'Guwahati', label: 'Guwahati' },
  { value: 'Ranchi', label: 'Ranchi' },
  { value: 'Siliguri', label: 'Siliguri' },
  { value: 'Durgapur', label: 'Durgapur' },
  { value: 'Asansol', label: 'Asansol' },
  { value: 'Cuttack', label: 'Cuttack' },
  { value: 'Jamshedpur', label: 'Jamshedpur' },
  { value: 'Dhanbad', label: 'Dhanbad' },
  { value: 'Bokaro', label: 'Bokaro' },
  { value: 'Purnia', label: 'Purnia' },
  { value: 'Muzaffarpur', label: 'Muzaffarpur' },
  // Central India
  { value: 'Bhopal', label: 'Bhopal' },
  { value: 'Indore', label: 'Indore' },
  { value: 'Raipur', label: 'Raipur' },
  { value: 'Jabalpur', label: 'Jabalpur' },
  { value: 'Gwalior', label: 'Gwalior' },
  { value: 'Ujjain', label: 'Ujjain' },
  { value: 'Sagar', label: 'Sagar' },
  { value: 'Satna', label: 'Satna' },
  { value: 'Rewa', label: 'Rewa' },
  // States and Regions
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Sikkim', label: 'Sikkim' },
  // Notable Agricultural Regions
  { value: 'Terai', label: 'Terai' },
  { value: 'Doab', label: 'Doab' },
  { value: 'Vidarbha', label: 'Vidarbha' },
  { value: 'Marathwada', label: 'Marathwada' },
  { value: 'Konkan', label: 'Konkan' },
  { value: 'Malwa', label: 'Malwa' },
  { value: 'Bundelkhand', label: 'Bundelkhand' },
  { value: 'Saurashtra', label: 'Saurashtra' },
  { value: 'Kutch', label: 'Kutch' },
  { value: 'Coastal Andhra', label: 'Coastal Andhra' },
  { value: 'Rayalaseema', label: 'Rayalaseema' },
  { value: 'North Bengal', label: 'North Bengal' },
  { value: 'South Bengal', label: 'South Bengal' },
  { value: 'Western Ghats', label: 'Western Ghats' },
  { value: 'Eastern Ghats', label: 'Eastern Ghats' },
  { value: 'Sundarbans', label: 'Sundarbans' },
  { value: 'Chotanagpur Plateau', label: 'Chotanagpur Plateau' },
  { value: 'Deccan Plateau', label: 'Deccan Plateau' },
  { value: 'Gangetic Plains', label: 'Gangetic Plains' },
  { value: 'Coromandel Coast', label: 'Coromandel Coast' },
  { value: 'Godavari Delta', label: 'Godavari Delta' },
  { value: 'Krishna Delta', label: 'Krishna Delta' },
  { value: 'Cauvery Delta', label: 'Cauvery Delta' }
];

export const IrrigationAdvicePanel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropType: '',
    soilType: '',
    region: '',
    weatherConditions: '',
    growthStage: '',
    soilMoisture: 50,
    lastIrrigationDate: new Date(),
  });

  const [recommendation, setRecommendation] = useState<{
    waterQuantity: string;
    nextIrrigationDate: string;
    confidence: number;
    summary: string;
    details: {
      cropWaterNeeds: string;
      expectedRainfall: string;
      soilRetention: string;
      reasoning: string;
    };
  } | null>(null);

  const [recommendationHistory, setRecommendationHistory] = useState<
    { date: string; waterQuantity: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Noida');
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [sliderActive, setSliderActive] = useState<string | null>(null);

  const cropOptions = [
    'Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Vegetables', 'Fruits',
    'Barley', 'Millet', 'Sorghum', 'Soybean', 'Groundnut', 'Sunflower', 'Mustard',
    'Pulses', 'Lentil', 'Chickpea', 'Pea', 'Potato', 'Tomato', 'Onion', 'Garlic',
    'Cabbage', 'Cauliflower', 'Carrot', 'Spinach', 'Okra', 'Brinjal', 'Pumpkin',
    'Banana', 'Mango', 'Papaya', 'Guava', 'Pomegranate', 'Apple', 'Grapes',
    'Tea', 'Coffee', 'Rubber', 'Jute', 'Tobacco', 'Cotton', 'Peanut', 'Sesame',
    'Coconut', 'Arecanut', 'Cashew', 'Oil Palm', 'Sugar Beet', 'Sweet Potato'
  ].sort();

  const soilOptions = [
    'Clay', 'Loam', 'Sandy', 'Silty', 'Peaty', 'Chalky','Loamy', 'Clayey', 'Alluvial', 'Black', 'Sandy Loam', 'Sandy', 'Laterite'
  ].sort();

  const growthStageOptions = ['Seedling', 'Vegetative', 'Flowering', 'Maturity'];

  const handleChange = (name: string, value: string | number | Date) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'region') {
      setSelectedLocation(value as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const geminiResponse = await getIrrigationAdviceFromGemini({
        cropType: formData.cropType,
        soilType: formData.soilType,
        region: formData.region,
        growthStage: formData.growthStage,
        soilMoisture: formData.soilMoisture,
        lastIrrigationDate: formData.lastIrrigationDate,
      });

      const newRecommendation = {
        waterQuantity: geminiResponse.waterQuantity || 'N/A',
        nextIrrigationDate: geminiResponse.nextDate || 'N/A',
        confidence: geminiResponse.confidence || 0,
        summary: geminiResponse.reasoning || '',
        details: {
          cropWaterNeeds: '',
          expectedRainfall: '',
          soilRetention: '',
          reasoning: geminiResponse.reasoning || '',
        },
      };

      setRecommendation(newRecommendation);

      // Add to history
      setRecommendationHistory(prev => [
        {
          date: new Date().toLocaleDateString(),
          waterQuantity: newRecommendation.waterQuantity,
        },
        ...prev,
      ]);
    } catch (error) {
      setRecommendation({
        waterQuantity: 'N/A',
        nextIrrigationDate: 'N/A',
        confidence: 0,
        summary: 'Could not get advice from Gemini API.',
        details: {
          cropWaterNeeds: '',
          expectedRainfall: '',
          soilRetention: '',
          reasoning: 'Error calling Gemini API',
        },
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData(selectedLocation);
        if (data) {
          setWeather(data);
          setError(null); // Clear any previous errors
        } else {
          setError(`Unable to fetch weather data for ${selectedLocation}. Please try another location.`);
        }
      } catch (err) {
        console.error('Error in weather fetch:', err);
        setError(`Unable to fetch weather data for ${selectedLocation}. Please try another location.`);
      }
    };

    fetchWeather();
  }, [selectedLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="p-6 rounded-xl shadow-md bg-white max-w-md mx-auto mt-20">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

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
          <Droplet className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Irrigation Advice</h1>
          <p className="text-gray-600 text-lg">Smart AI-powered water management suggestions based on crop, soil, and weather data</p>
          {weather && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <div className="flex items-center"><Thermometer className="h-5 w-5 mr-2" /><span>{weather.temperature}°C</span></div>
              <div className="flex items-center"><Droplet className="h-5 w-5 mr-2" /><span>{weather.humidity}%</span></div>
              <div className="flex items-center"><Cloud className="h-5 w-5 mr-2" /><span>{weather.description}</span></div>
              <div className="flex items-center"><Wind className="h-5 w-5 mr-2" /><span>{weather.windSpeed} m/s</span></div>
              <div className="text-sm">Last updated: {weather.lastUpdated}</div>
            </div>
          )}
        </motion.div>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Droplet className="mr-2" /> Irrigation Parameters
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Fill in your field's details for a smart irrigation suggestion.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Crop Type */}
                <div className="mb-6">
                  <Label htmlFor="cropType" className="font-semibold">Crop Type</Label>
                  <Select value={formData.cropType} onValueChange={(value) => handleChange('cropType', value)}>
                    <SelectTrigger className={`w-full ${focusedField === 'cropType' ? 'ring-2 ring-green-500 border-green-500' : ''}`} onFocus={() => setFocusedField('cropType')} onBlur={() => setFocusedField(null)}>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {cropOptions.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Soil Type */}
                <div className="mb-6">
                  <Label htmlFor="soilType" className="font-semibold">Soil Type</Label>
                  <Select value={formData.soilType} onValueChange={(value) => handleChange('soilType', value)}>
                    <SelectTrigger className={`w-full ${focusedField === 'soilType' ? 'ring-2 ring-green-500 border-green-500' : ''}`} onFocus={() => setFocusedField('soilType')} onBlur={() => setFocusedField(null)}>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {soilOptions.map((soil) => (
                        <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Region */}
                <div className="mb-6">
                  <Label htmlFor="region" className="font-semibold">Region / Location</Label>
                  <Select value={formData.region} onValueChange={(value) => handleChange('region', value)}>
                    <SelectTrigger className={`w-full ${focusedField === 'region' ? 'ring-2 ring-green-500 border-green-500' : ''}`} onFocus={() => setFocusedField('region')} onBlur={() => setFocusedField(null)}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>{location.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Growth Stage */}
                <div className="mb-6">
                  <Label htmlFor="growthStage" className="font-semibold">Growth Stage</Label>
                  <Select value={formData.growthStage} onValueChange={(value) => handleChange('growthStage', value)}>
                    <SelectTrigger className={`w-full ${focusedField === 'growthStage' ? 'ring-2 ring-green-500 border-green-500' : ''}`} onFocus={() => setFocusedField('growthStage')} onBlur={() => setFocusedField(null)}>
                      <SelectValue placeholder="Select growth stage" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {growthStageOptions.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Soil Moisture */}
                <div className="mb-6">
                  <Label htmlFor="soilMoisture">Soil Moisture: {formData.soilMoisture}%</Label>
                  <Slider
                    value={[formData.soilMoisture]}
                    onValueChange={(value) => handleChange('soilMoisture', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className={`[&>span:first-child]:bg-gray-200 ${sliderActive === 'soilMoisture' ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                    onPointerDown={() => setSliderActive('soilMoisture')}
                    onPointerUp={() => setSliderActive(null)}
                    onBlur={() => setSliderActive(null)}
                  />
                </div>
                {/* Last Irrigation Date */}
                <div className="mb-6">
                  <Label htmlFor="lastIrrigationDate" className="font-semibold">Last Irrigation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.lastIrrigationDate ? (
                          format(formData.lastIrrigationDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.lastIrrigationDate}
                        onSelect={(date) => handleChange('lastIrrigationDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="bg-black text-white hover:bg-gray-800 w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? 'Generating Advice...' : 'Get Irrigation Advice'}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Right: Result Panel */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 min-h-[500px] bg-white p-8 shadow-md rounded-2xl">
            <CardHeader className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Droplet className="h-8 w-8 text-green-600" />
                <CardTitle className="text-2xl font-bold">Irrigation Recommendation</CardTitle>
              </div>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-4 py-1 rounded-full mb-4">
                AI Recommendation
              </span>
              <p className="text-gray-500 text-base mb-6">Your personalized irrigation recommendation will appear here.</p>
              <div className="flex flex-wrap gap-x-10 gap-y-4 items-center justify-between bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 min-w-[180px]">
                  <Droplet className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Water Quantity</div>
                    <div className="font-semibold text-lg text-gray-800">{recommendation?.waterQuantity || '--'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-[180px]">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                  <div>
                    <div className="text-xs text-gray-500">Next Irrigation</div>
                    <div className="font-semibold text-lg text-gray-800">{recommendation?.nextIrrigationDate || '--'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-[180px]">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="font-semibold text-lg text-gray-800">{recommendation?.confidence || '--'}%</div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="font-semibold text-gray-800 mb-2">Summary</div>
                <div className="text-gray-700 text-base leading-relaxed">{recommendation?.summary || '--'}</div>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="font-semibold text-gray-800">Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                      {recommendation?.details?.reasoning || '--'}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardHeader>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}; 