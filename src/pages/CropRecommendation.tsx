import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Thermometer, CloudRain, Droplet, Sun, Sprout, Wind, FlaskConical, LandPlot, Info, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import axios from 'axios';
import { apiUrl } from "../lib/utils";

const cropImages = {
  rice:  "https://plus.unsplash.com/premium_photo-1705338026411-00639520a438?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  maize:   "https://images.unsplash.com/photo-1693672842885-841644e3daf2?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",
  chickpea:"https://plus.unsplash.com/premium_photo-1675237625824-40a9c6400ad8?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",
  kidneybeans:"https://plus.unsplash.com/premium_photo-1671130295242-582789bd9861?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  pigeonpeas:"https://habko.ng/wp-content/uploads/2023/10/muneer-ahmed-ok-WsZd1yxPkqs-unsplash-1-scaled.jpg ",
  mothbeans:"https://ooofarms.com/cdn/shop/products/MothBean1_whole.jpg?v=1736744811 ",
  mungbean:"https://www.pulseaus.com.au/storage/app/uploads/public/569/9e6/8db/5699e68dbdda4963259321.jpg ",
  blackgram:"https://upload.wikimedia.org/wikipedia/commons/6/6f/Black_gram.jpg ",

  lentil:  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7CSPGnpKxe_ue3mddmCDUhBJkuj_DL8nmCA&s",

  pomegranate:"https://images.unsplash.com/photo-1664124693991-8118f4dd554d?q=80&w=2489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  banana:  "https://plus.unsplash.com/premium_photo-1675731118330-08c71253af17?q=80&w=2427&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  mango:   "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=2448&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ,

  grapes:  "https://images.unsplash.com/photo-1515778767554-42d4b373f2b3?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ,

  watermelon:"https://images.unsplash.com/photo-1708982553355-794739c6693e?q=80&w=2425&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ,

  muskmelon: "https://images.unsplash.com/photo-1646992122113-bd1f335187ac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVza21lbG9ufGVufDB8fDB8fHww ",

  apple:   "https://plus.unsplash.com/premium_photo-1661322640130-f6a1e2c36653?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  orange:  "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=2535&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  papaya:  "https://plus.unsplash.com/premium_photo-1675639895212-696149c275f9?q=80&w=2427&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  coconut: "https://plus.unsplash.com/premium_photo-1675040830227-9f18e88fd1f9?q=80&w=2427&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  cotton:  "https://images.unsplash.com/photo-1502395809857-fd80069897d0?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",

  jute:    "https://plus.unsplash.com/premium_photo-1674624789813-aee3aaa976cb?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ,
  coffee:  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2561&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
};

const cropDescriptions = {
  rice: "Rice requires high temperatures, humidity, and a good amount of rainfall. It grows best in alluvial clayey soil with standing water.",
  maize: "Maize prefers moderate rainfall and warm weather. It thrives in well-drained fertile soil and is highly adaptable to various climates.",
  chickpea: "Chickpeas grow best in cool and dry climates. They require loamy or sandy soil and do not tolerate excess moisture.",
  kidneybeans: "Kidney beans prefer warm climates with moderate rainfall. They grow well in well-drained loamy soil rich in organic matter.",
  pigeonpeas: "Pigeonpeas thrive in semi-arid regions with moderate rainfall. They prefer well-drained loamy soil and are drought-resistant.",
  mothbeans: "Moth beans grow in dry, hot climates and are highly drought-tolerant. They prefer sandy or loamy soils.",
  mungbean: "Mung beans grow well in warm, humid climates. They require well-drained loamy soil and moderate rainfall.",
  blackgram: "Black gram requires hot and humid conditions. It grows best in well-drained loamy or clayey soil.",
  lentil: "Lentils thrive in cool climates with moderate rainfall. They prefer sandy loam soil with good drainage.",
  pomegranate: "Pomegranates grow in hot, dry climates. They prefer loamy soil and are tolerant of drought and poor soils.",
  banana: "Bananas require tropical, humid climates with consistent warmth and rainfall. They grow best in rich, well-drained soil.",
  mango: "Mango trees flourish in tropical and subtropical climates with dry summers and wet monsoons. They prefer well-drained alluvial soil.",
  grapes: "Grapes thrive in warm, dry climates. They need well-drained sandy loam or clay loam soil for optimal growth.",
  watermelon: "Watermelons grow well in warm climates with sandy or loamy soil. They need plenty of sunlight and moderate irrigation.",
  muskmelon: "Muskmelons prefer warm, dry climates and sandy loam soil. They require good drainage and moderate watering.",
  apple: "Apples require a temperate climate with cold winters and well-distributed rainfall. They grow best in well-drained loamy soil.",
  orange: "Oranges need a subtropical to tropical climate. They prefer sandy loam soil with good drainage and regular watering.",
  papaya: "Papayas grow well in warm, humid climates with rich, well-drained soil. They require plenty of sunlight and protection from wind.",
  coconut: "Coconut palms thrive in tropical climates with high humidity and rainfall. They prefer sandy, well-drained soil near coastlines.",
  cotton: "Cotton requires a long frost-free period, plenty of sunshine, and moderate rainfall. It grows best in black or alluvial soil.",
  jute: "Jute plants grow in warm, humid climates with well-drained alluvial soil. They require standing water during early growth.",
  coffee: "Coffee grows best in tropical highland climates with moderate rainfall and shade. It prefers rich, well-drained volcanic soil."
};

const CropRecommendation = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    soilType: '',
    pHLevel: 6.5,
    nitrogen: 50,
    phosphorus: 25,
    potassium: 70,
    temperature: 25,
    humidity: 75,
    rainfall: 120,
  });
  const [result, setResult] = useState("");
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropDescription, setCropDescription] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [sliderActive, setSliderActive] = useState<string | null>(null);
  // Store refs for each input field
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFocusedField(name);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0],
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      // Only soilType is a string, all others are numbers
      if (name === 'soilType') {
        return { ...prev, [name]: value };
      } else {
        return { ...prev, [name]: Number(value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult("");
    setCropImageUrl("");
    setCropDescription("");

    try {
      const res = await axios.post(apiUrl("/api/crop/predict-crop"), {
        N: parseFloat(formData.nitrogen.toString()),
        P: parseFloat(formData.phosphorus.toString()),
        K: parseFloat(formData.potassium.toString()),
        temperature: parseFloat(formData.temperature.toString()),
        humidity: parseFloat(formData.humidity.toString()),
        ph: parseFloat(formData.pHLevel.toString()),
        rainfall: parseFloat(formData.rainfall.toString()),
      });
      const predictedCrop = res.data.predicted_crop.toLowerCase();
      setResult(predictedCrop);
      setCropImageUrl(cropImages[predictedCrop] || "");
      setCropDescription(cropDescriptions[predictedCrop] || "");
    } catch (err) {
      alert("Prediction failed. Please ensure all fields are filled correctly and the backend server is running.");
      console.error("Prediction error:", err);
      setResult("");
      setCropImageUrl("");
      setCropDescription("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Leaf className="h-10 w-10 text-green-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Smart Crop Recommendation</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Enter your soil and climate data to get a personalized crop suggestion powered by machine learning.
          </p>
        </motion.div>
        <div className="flex flex-col lg:flex-row gap-8 bg-white">
          {/* Left: Input Form */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 bg-white border border-gray-200">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="text-2xl font-bold flex items-center tracking-tight">
                <LandPlot className="h-7 w-7 text-green-700" /> Soil & Climate Information
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Fill in your field's details for a smart crop suggestion.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Soil Information */}
                <div className="mb-6">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-4 mt-2">
                    <LandPlot className="w-4 h-4" /> Soil Information
                  </h3>
                  <div className="mb-6">
                    <Label htmlFor="soilType" className="font-semibold">Soil Type</Label>
                    <Select name="soilType" value={formData.soilType || ''} onValueChange={value => handleSelectChange('soilType', value)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="silty">Silty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="pHLevel">pH Level (3.5-9.94): {formData.pHLevel}</Label>
                    <Slider
                      value={[formData.pHLevel]}
                      onValueChange={value => handleSliderChange('pHLevel', value)}
                      min={3.5}
                      max={9.94}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="nitrogen">Nitrogen (N) - mg/kg: {formData.nitrogen}</Label>
                    <Slider
                      value={[formData.nitrogen]}
                      onValueChange={value => handleSliderChange('nitrogen', value)}
                      min={0}
                      max={140}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="phosphorus">Phosphorus (P) - mg/kg: {formData.phosphorus}</Label>
                    <Slider
                      value={[formData.phosphorus]}
                      onValueChange={value => handleSliderChange('phosphorus', value)}
                      min={5}
                      max={145}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="potassium">Potassium (K) - mg/kg: {formData.potassium}</Label>
                    <Slider
                      value={[formData.potassium]}
                      onValueChange={value => handleSliderChange('potassium', value)}
                      min={5}
                      max={205}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                </div>
                {/* Climate Information */}
                <div className="mb-8">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-4 mt-8">
                    <Thermometer className="w-4 h-4" /> Climate Information
                  </h3>
                  <div className="mb-6">
                    <Label htmlFor="temperature">Temperature (°C): {formData.temperature}</Label>
                    <Slider
                      value={[formData.temperature]}
                      onValueChange={value => handleSliderChange('temperature', value)}
                      min={8.83}
                      max={43.68}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="humidity">Humidity (%): {formData.humidity}</Label>
                    <Slider
                      value={[formData.humidity]}
                      onValueChange={value => handleSliderChange('humidity', value)}
                      min={14.26}
                      max={99.98}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="rainfall">Rainfall (mm): {formData.rainfall}</Label>
                    <Slider
                      value={[formData.rainfall]}
                      onValueChange={value => handleSliderChange('rainfall', value)}
                      min={20.21}
                      max={298.56}
                      step={0.01}
                      className="[&>span:first-child]:bg-gray-200"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-700 text-white hover:bg-green-800 mt-4" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Get Recommendation'}
                </Button>
                <Button type="button" variant="outline" className="w-full mt-2" onClick={() => navigate('/services')}>
                  Back to Services
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Right: Results/Placeholder */}
          <Card className="flex-1 max-w-xl mx-auto lg:mx-0 min-h-[500px]">
            <CardHeader className="flex flex-col space-y-1.5 p-6">
              <CardTitle className="text-2xl font-bold flex items-center tracking-tight">
                <Sprout className="h-7 w-7 text-green-700" /> Crop Recommendation
              </CardTitle>
              <p className="text-gray-500 text-base mt-2">Your personalized crop recommendation will appear here.</p>
            </CardHeader>
            <CardContent>
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-80 h-96 mb-4 rounded-lg overflow-hidden shadow-1xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0px_20px_rgb(0,0,0)]">
                      {cropImageUrl && (
                        <>
                          <img
                            src={cropImageUrl}
                            alt={result}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available'; }}
                          />
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full font-semibold text-sm shadow">
                            Recommended Crop
                          </div>
                        </>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold capitalize">{result}</h2>
                    {cropDescription && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Crop Details</h4>
                        <p className="text-gray-600 text-sm">{cropDescription}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Optimal Conditions</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><Thermometer className="w-4 h-4" />Temperature: {formData.temperature}°C</li>
                          <li className="flex items-center gap-2"><Droplet className="w-4 h-4" />Humidity: {formData.humidity}%</li>
                          <li className="flex items-center gap-2"><CloudRain className="w-4 h-4" />Rainfall: {formData.rainfall}mm</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Soil Requirements</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><FlaskConical className="w-4 h-4" />pH Level: {formData.pHLevel}</li>
                          <li className="flex items-center gap-2"><Sprout className="w-4 h-4" />N-P-K: {formData.nitrogen}-{formData.phosphorus}-{formData.potassium}</li>
                          <li className="flex items-center gap-2"><LandPlot className="w-4 h-4" />Type: {formData.soilType}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full py-12">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Leaf className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No recommendation yet</h3>
                  <p className="text-gray-600 max-w-sm mx-auto text-center">
                    Enter your soil and climate data on the left and click <span className="font-semibold">Get Recommendation</span> to see the best crop for your field!
                  </p>
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

export default CropRecommendation; 