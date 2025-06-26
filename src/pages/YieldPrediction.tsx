import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Thermometer, CloudRain, Droplet, Sprout, CalendarDays, FlaskConical, Bug, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn, apiUrl } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const YieldPrediction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crop: '',
    state: '',
    season: '',
    rainfall: 1200,
    fertilizer: 150,
    pesticide: 0.25,
  });
  const [result, setResult] = useState<{
    predicted_yield: number;
    unit: string;
    confidence?: number;
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

  const handleSelectChange = (name: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.crop || !formData.state || !formData.season) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch(apiUrl('/api/yield/predict'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: formData.crop,
          state: formData.state,
          season: formData.season,
          rainfall: formData.rainfall,
          fertilizer: formData.fertilizer,
          pesticide: formData.pesticide,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to predict yield');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
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
          <TrendingUp className="mx-auto h-16 w-16 text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Yield Prediction</h1>
          <p className="text-gray-600 text-lg">Forecast crop yields using machine learning and historical data analysis.</p>
        </motion.div>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
                <Leaf className="mr-2" /> Crop & Climate Information
            </CardTitle>
              <p className="text-gray-500 text-base mt-2">Fill in your field's details for accurate yield prediction.</p>
          </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Crop Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-2">Crop Information</h2>
                  <div className="mb-6">
                    <Label htmlFor="crop" className="font-semibold">Crop Type </Label>
                    <Select name="crop" onValueChange={(value) => handleSelectChange('crop', value)}>
                  <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your crop" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="Arecanut">Arecanut</SelectItem>
                        <SelectItem value="Arhar/Tur">Arhar/Tur</SelectItem>
                        <SelectItem value="Castor seed">Castor seed</SelectItem>
                        <SelectItem value="Coconut">Coconut</SelectItem>
                        <SelectItem value="Cotton(lint)">Cotton(lint)</SelectItem>
                        <SelectItem value="Dry chillies">Dry chillies</SelectItem>
                        <SelectItem value="Gram">Gram</SelectItem>
                        <SelectItem value="Jute">Jute</SelectItem>
                        <SelectItem value="Linseed">Linseed</SelectItem>
                        <SelectItem value="Maize">Maize</SelectItem>
                        <SelectItem value="Mesta">Mesta</SelectItem>
                        <SelectItem value="Niger seed">Niger seed</SelectItem>
                        <SelectItem value="Onion">Onion</SelectItem>
                        <SelectItem value="Other  Rabi pulses">Other Rabi pulses</SelectItem>
                        <SelectItem value="Potato">Potato</SelectItem>
                        <SelectItem value="Rapeseed &Mustard">Rapeseed &Mustard</SelectItem>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Sesamum">Sesamum</SelectItem>
                        <SelectItem value="Small millets">Small millets</SelectItem>
                        <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="Sweet potato">Sweet potato</SelectItem>
                        <SelectItem value="Tapioca">Tapioca</SelectItem>
                        <SelectItem value="Tobacco">Tobacco</SelectItem>
                        <SelectItem value="Turmeric">Turmeric</SelectItem>
                        <SelectItem value="Wheat">Wheat</SelectItem>
                        <SelectItem value="Bajra">Bajra</SelectItem>
                        <SelectItem value="Black pepper">Black pepper</SelectItem>
                        <SelectItem value="Cardamom">Cardamom</SelectItem>
                        <SelectItem value="Coriander">Coriander</SelectItem>
                        <SelectItem value="Garlic">Garlic</SelectItem>
                        <SelectItem value="Ginger">Ginger</SelectItem>
                        <SelectItem value="Groundnut">Groundnut</SelectItem>
                        <SelectItem value="Horse-gram">Horse-gram</SelectItem>
                        <SelectItem value="Jowar">Jowar</SelectItem>
                        <SelectItem value="Ragi">Ragi</SelectItem>
                        <SelectItem value="Cashewnut">Cashewnut</SelectItem>
                        <SelectItem value="Banana">Banana</SelectItem>
                        <SelectItem value="Soyabean">Soyabean</SelectItem>
                        <SelectItem value="Barley">Barley</SelectItem>
                        <SelectItem value="Khesari">Khesari</SelectItem>
                        <SelectItem value="Masoor">Masoor</SelectItem>
                        <SelectItem value="Moong(Green Gram)">Moong(Green Gram)</SelectItem>
                        <SelectItem value="Other Kharif pulses">Other Kharif pulses</SelectItem>
                        <SelectItem value="Safflower">Safflower</SelectItem>
                        <SelectItem value="Sannhamp">Sannhamp</SelectItem>
                        <SelectItem value="Sunflower">Sunflower</SelectItem>
                        <SelectItem value="Urad">Urad</SelectItem>
                        <SelectItem value="Peas & beans (Pulses)">Peas & beans (Pulses)</SelectItem>
                        <SelectItem value="other oilseeds">other oilseeds</SelectItem>
                        <SelectItem value="Other Cereals">Other Cereals</SelectItem>
                        <SelectItem value="Cowpea(Lobia)">Cowpea(Lobia)</SelectItem>
                        <SelectItem value="Oilseeds total">Oilseeds total</SelectItem>
                        <SelectItem value="Guar seed">Guar seed</SelectItem>
                        <SelectItem value="Other Summer Pulses">Other Summer Pulses</SelectItem>
                        <SelectItem value="Moth">Moth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  <div className="mb-6">
                    <Label htmlFor="state" className="font-semibold">State </Label>
                    <Select name="state" onValueChange={(value) => handleSelectChange('state', value)}>
                  <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="Assam">Assam</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Kerala">Kerala</SelectItem>
                        <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                        <SelectItem value="Puducherry">Puducherry</SelectItem>
                        <SelectItem value="Goa">Goa</SelectItem>
                        <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Odisha">Odisha</SelectItem>
                        <SelectItem value="Bihar">Bihar</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                        <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Mizoram">Mizoram</SelectItem>
                        <SelectItem value="Punjab">Punjab</SelectItem>
                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="Haryana">Haryana</SelectItem>
                        <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                        <SelectItem value="Tripura">Tripura</SelectItem>
                        <SelectItem value="Nagaland">Nagaland</SelectItem>
                        <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                        <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                        <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Manipur">Manipur</SelectItem>
                        <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                        <SelectItem value="Telangana">Telangana</SelectItem>
                        <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                        <SelectItem value="Sikkim">Sikkim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  <div className="mb-6">
                    <Label htmlFor="season" className="font-semibold">Season </Label>
                    <Select name="season" onValueChange={(value) => handleSelectChange('season', value)}>
                  <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="Whole Year">Whole Year</SelectItem>
                        <SelectItem value="Kharif">Kharif</SelectItem>
                        <SelectItem value="Rabi">Rabi</SelectItem>
                        <SelectItem value="Autumn">Autumn</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                </div>
                {/* Climate & Input Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-green-700 mb-4 mt-8">Climate & Input Information</h2>
                  <div className="mb-6">
                    <Label htmlFor="rainfall">Annual Rainfall: {formData.rainfall} mm</Label>
                    <Slider
                      value={[formData.rainfall]}
                      onValueChange={(value) => handleSliderChange('rainfall', value)}
                      min={300.30}
                      max={6560.70}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
              </div>
                  <div className="mb-6">
                    <Label htmlFor="fertilizer">Fertilizer Usage: {formData.fertilizer} kg/ha</Label>
                    <Slider
                      value={[formData.fertilizer]}
                      onValueChange={(value) => handleSliderChange('fertilizer', value)}
                      min={94}
                      max={190}
                      step={1}
                      className="[&>span:first-child]:bg-gray-200"
                    />
              </div>
                  <div className="mb-6">
                    <Label htmlFor="pesticide">Pesticide Usage: {formData.pesticide} kg/ha</Label>
                    <Slider
                      value={[formData.pesticide]}
                      onValueChange={(value) => handleSliderChange('pesticide', value)}
                      min={0.1}
                      max={0.38}
                      step={0.01}
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
                    {loading ? 'Predicting Yield...' : 'Predict Yield'}
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
                <TrendingUp className="mr-2" /> Yield Prediction
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Your predicted yield will appear here.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600">Predicting your yield...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                  <h2 className="text-2xl font-semibold mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <TrendingUp className="h-16 w-16 text-purple-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No prediction yet</h2>
                  <p className="text-gray-500 text-center max-w-xs">
                    Enter your crop and climate data on the left and click <span className="font-semibold">Predict Yield</span> to see your expected harvest!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-72 h-96 mb-8 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    {result.confidence && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                            {Math.round(result.confidence * 100)}% Confidence
                        </div>
                    )}
                    <div className="text-center">
                      <TrendingUp className="h-24 w-24 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Predicted Yield</h3>
                    </div>
                  </div>
                  <div className="w-full space-y-6">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold text-purple-600 mb-3">
                        {result.predicted_yield} {result.unit}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {result.note || 'Based on your input parameters, this is the expected yield for your crop.'}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-purple-200">Prediction Insights</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="text-gray-700 font-medium">Crop: {formData.crop}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="text-gray-700 font-medium">State: {formData.state}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="text-gray-700 font-medium">Season: {formData.season}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="text-gray-600">This prediction is based on historical data and current agricultural practices.</p>
                          </div>
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

export default YieldPrediction; 