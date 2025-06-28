import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import CropRecommendation from "./pages/CropRecommendation";
import FertilizerRecommendation from "./pages/FertilizerRecommendation";
import YieldPrediction from "./pages/YieldPrediction";
import PestDiseasePrediction from "./pages/PestDiseasePrediction";
import CropRotationPlanner from "./pages/CropRotationPlanner";
import IrrigationAdvice from "./pages/IrrigationAdvice";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import SchemeDetails from "./pages/SchemeDetails";
import ImageUpload from "./pages/ImageUpload";
import ReportIssue from "./pages/ReportIssue";
import ScrollToTop from '@/components/ScrollToTop';
import DiseaseDatabase from './pages/DiseaseDatabase';
import CropCalendar from './pages/CropCalendar';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/fertilizer-recommendation" element={<FertilizerRecommendation />} />
            <Route path="/yield-prediction" element={<YieldPrediction />} />
            <Route path="/pest-disease" element={<PestDiseasePrediction />} />
            <Route path="/crop-rotation" element={<CropRotationPlanner />} />
            <Route path="/irrigation-advice" element={<IrrigationAdvice />} />
            <Route path="/government-schemes" element={<GovernmentSchemes />} />
            <Route path="/schemes/:schemeId" element={<SchemeDetails />} />
            <Route path="/image-upload" element={<ImageUpload />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/disease-database" element={<DiseaseDatabase />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LoadingProvider>
  </QueryClientProvider>
);

export default App;
