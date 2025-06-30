import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  type: 'planting' | 'harvest' | 'treatment' | 'prevention' | 'monitoring' | 'fertilizer';
  crop: string;
  date: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  location?: string;
  notes?: string;
}

interface CropSeason {
  id: string;
  crop: string;
  startDate: Date;
  endDate: Date;
  plantingDate: Date;
  harvestDate: Date;
  growthStages: {
    name: string;
    startDay: number;
    endDay: number;
  }[];
  totalDays: number;
}

const cropData = {
  'Tomato': {
    planting: ['February-April', 'July-September'],
    harvest: ['75 days from planting'],
    germination: '6 days',
    vegetativeGrowth: '25 days',
    flowering: '20 days',
    fruitDevelopment: '30 days',
    totalSeason: '90 days',
    growthStages: [
      'Germination (0-6d)',
      'Vegetative (7-31d)', 
      'Flowering (32-52d)',
      'Fruiting (53-83d)',
      'Maturity (84-90d)'
    ],
    criticalCare: 'Vegetative to flowering stage',
    diseaseProne: 'Flowering to fruiting stage',
    fertilizerWindows: [
      'Basal dose before planting',
      'Top dressing at 30 days',
      'Top dressing at 60 days'
    ],
    irrigationCritical: 'During flowering and fruit setting',
    pestMonitoring: 'Throughout, especially from vegetative to fruiting stage',
    diseases: ['Late Blight', 'Early Blight', 'Septoria Leaf Spot'],
    treatments: ['Fungicide application', 'Pruning', 'Mulching']
  },
  'Potato': {
    planting: ['October-December'],
    harvest: ['90 days from planting'],
    germination: '10 days',
    vegetativeGrowth: '30 days',
    flowering: '15 days',
    fruitDevelopment: '35 days',
    totalSeason: '100 days',
    growthStages: [
      'Sprouting (0-10d)',
      'Vegetative (11-40d)',
      'Tuber Initiation (41-55d)',
      'Bulking (56-90d)',
      'Maturity (91-100d)'
    ],
    criticalCare: 'Tuber initiation and bulking stage',
    diseaseProne: 'Tuber bulking stage',
    fertilizerWindows: [
      'Before planting',
      'Top dressing at 30 days',
      'Top dressing at 60 days'
    ],
    irrigationCritical: 'Tuber initiation to bulking stage',
    pestMonitoring: 'From sprouting to harvest',
    diseases: ['Late Blight', 'Early Blight', 'Bacterial Wilt'],
    treatments: ['Fungicide sprays', 'Hilling', 'Crop rotation']
  },
  'Wheat': {
    planting: ['November-December'],
    harvest: ['120 days from planting'],
    germination: '7 days',
    vegetativeGrowth: '35 days',
    flowering: '15 days',
    fruitDevelopment: '30 days',
    totalSeason: '130 days',
    growthStages: [
      'Germination (0-7d)',
      'Tillering (8-30d)',
      'Jointing (31-65d)',
      'Heading (66-80d)',
      'Grain filling (81-110d)',
      'Maturity (111-130d)'
    ],
    criticalCare: 'Tillering and heading stages',
    diseaseProne: 'Heading and grain filling stages',
    fertilizerWindows: [
      'Basal dose at sowing',
      'Top dressing at tillering',
      'Top dressing at jointing'
    ],
    irrigationCritical: 'Crown root initiation and heading stages',
    pestMonitoring: 'Tillering to grain filling stage',
    diseases: ['Rust', 'Powdery Mildew', 'Ergot'],
    treatments: ['Fungicide application', 'Resistant varieties', 'Timely sowing']
  },
  'Rice': {
    planting: ['June-July', 'November-December'],
    harvest: ['130 days from planting'],
    germination: '5 days',
    vegetativeGrowth: '30 days',
    flowering: '20 days',
    fruitDevelopment: '40 days',
    totalSeason: '140 days',
    growthStages: [
      'Germination (0-5d)',
      'Vegetative (6-35d)',
      'Panicle Initiation (36-60d)',
      'Flowering (61-80d)',
      'Grain Filling (81-120d)',
      'Maturity (121-140d)'
    ],
    criticalCare: 'Panicle initiation to grain filling stage',
    diseaseProne: 'Panicle initiation to flowering stage',
    fertilizerWindows: [
      'Basal dose before transplanting',
      'Top dressing at tillering',
      'Top dressing at panicle initiation'
    ],
    irrigationCritical: 'Tillering and flowering stage',
    pestMonitoring: 'From transplanting to maturity',
    diseases: ['Bacterial Leaf Blight', 'Rice Blast', 'Brown Spot'],
    treatments: ['Seed treatment', 'Balanced nutrition', 'Water management']
  },
  'Corn': {
    planting: ['June-July', 'October-November'],
    harvest: ['100 days from planting'],
    germination: '6 days',
    vegetativeGrowth: '35 days',
    flowering: '15 days',
    fruitDevelopment: '40 days',
    totalSeason: '110 days',
    growthStages: [
      'Germination (0-6d)',
      'Vegetative (7-41d)',
      'Tasseling (42-57d)',
      'Silking (58-72d)',
      'Grain filling (73-100d)',
      'Maturity (101-110d)'
    ],
    criticalCare: 'Tasseling to grain filling',
    diseaseProne: 'Silking to grain filling stage',
    fertilizerWindows: [
      'At planting',
      'Top dressing at 30 days',
      'Top dressing at 60 days'
    ],
    irrigationCritical: 'Silking and grain filling stage',
    pestMonitoring: 'Vegetative to grain filling stage',
    diseases: ['Turcicum Leaf Blight', 'Common Rust', 'Smut'],
    treatments: ['Fungicide application', 'Resistant hybrids', 'Field hygiene']
  }
};

const CropCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeason[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getCropSeasonsForDate = (date: Date) => {
    return cropSeasons.filter(season => {
      const dateTime = date.getTime();
      return dateTime >= season.startDate.getTime() && dateTime <= season.endDate.getTime();
    });
  };

  const addCropSeason = (cropName: string, plantingDate: Date) => {
    const crop = cropData[cropName as keyof typeof cropData];
    if (!crop) return;

    const startTime = plantingDate.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    const totalDays = parseInt(crop.totalSeason);
    const endDate = new Date(startTime + (totalDays * dayInMs));
    const harvestDays = parseInt(crop.harvest[0].split(' ')[0]);
    const harvestDate = new Date(startTime + (harvestDays * dayInMs));

    const growthStages = crop.growthStages.map(stage => {
      const [name, days] = stage.split(' (');
      const [startDay, endDay] = days.replace('d)', '').split('-').map(d => parseInt(d));
      return { name, startDay, endDay };
    });

    const newSeason = {
      id: Date.now().toString(),
      crop: cropName,
      startDate: plantingDate,
      endDate: endDate,
      plantingDate: plantingDate,
      harvestDate: harvestDate,
      growthStages,
      totalDays
    };

    setCropSeasons(prev => {
      // Remove any preview seasons for this crop
      const filtered = prev.filter(s => s.id !== 'preview-' + cropName);
      return [...filtered, newSeason];
    });
  };

  // Helper to get month index from name
  const getMonthIndex = (month: string) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Accept both short and long names
    const idx = monthNames.findIndex(m => m.toLowerCase() === month.slice(0,3).toLowerCase());
    return idx;
  };

  // Improved validation for planting date
  const isValidPlantingDate = (crop: any, date: Date) => {
    if (!crop || !date) return false;
    const month = date.getMonth();
    return crop.planting.some((season: string) => {
      if (season === 'Year-round') return true;
      if (season.includes('-')) {
        const [start, end] = season.split('-');
        const startMonth = getMonthIndex(start.trim());
        const endMonth = getMonthIndex(end.trim());
        if (startMonth === -1 || endMonth === -1) return false;
        if (startMonth <= endMonth) {
          return month >= startMonth && month <= endMonth;
        } else {
          // Cross-year range (e.g., Nov-Feb)
          return month >= startMonth || month <= endMonth;
        }
      } else {
        // Single month
        const singleMonth = getMonthIndex(season.trim());
        return month === singleMonth;
      }
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return nextYear.toISOString().split('T')[0];
  };

  const getCropSeasonColor = (cropName: string) => {
    const colors = {
      'Tomato': 'bg-red-200 border-red-400',
      'Potato': 'bg-purple-200 border-purple-400',
      'Wheat': 'bg-amber-200 border-amber-400',
      'Rice': 'bg-emerald-200 border-emerald-400',
      'Corn': 'bg-orange-200 border-orange-400'
    };
    return colors[cropName as keyof typeof colors] || 'bg-gray-200 border-gray-400';
  };

  const getCropSeasonOpacity = (date: Date, season: CropSeason) => {
    const totalDays = season.totalDays;
    const daysFromStart = Math.floor((date.getTime() - season.startDate.getTime()) / (24 * 60 * 60 * 1000));
    const progress = Math.max(0, Math.min(1, daysFromStart / totalDays));
    
    // Different opacity for different growth stages - increased for better mobile visibility
    if (daysFromStart < parseInt(cropData[season.crop as keyof typeof cropData].germination)) {
      return 'opacity-50'; // Germination - increased from 30
    } else if (daysFromStart < parseInt(cropData[season.crop as keyof typeof cropData].germination) + parseInt(cropData[season.crop as keyof typeof cropData].vegetativeGrowth)) {
      return 'opacity-70'; // Vegetative - increased from 50
    } else if (daysFromStart < parseInt(cropData[season.crop as keyof typeof cropData].germination) + parseInt(cropData[season.crop as keyof typeof cropData].vegetativeGrowth) + parseInt(cropData[season.crop as keyof typeof cropData].flowering)) {
      return 'opacity-85'; // Flowering - increased from 70
    } else {
      return 'opacity-95'; // Fruiting - increased from 90
    }
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
    setShowAddEvent(false);
  };

  const suggestEventsForCrop = (cropName: string, startDate: Date) => {
    const crop = cropData[cropName as keyof typeof cropData];
    if (!crop) return [];

    const suggestions: Omit<CalendarEvent, 'id'>[] = [];
    const startTime = startDate.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    // Planting event
    suggestions.push({
      title: `Plant ${cropName}`,
      type: 'planting',
      crop: cropName,
      date: startDate,
      description: `Plant ${cropName} seeds/seedlings. Germination takes ${crop.germination} days.`,
      priority: 'high',
      completed: false
    });

    // Fertilizer events
    crop.fertilizerWindows.forEach((window, index) => {
      const daysOffset = index === 0 ? 0 : (index === 1 ? 30 : 60);
      const eventDate = new Date(startTime + (daysOffset * dayInMs));
      
      suggestions.push({
        title: `Fertilize ${cropName}`,
        type: 'fertilizer',
        crop: cropName,
        date: eventDate,
        description: `${window}. Critical for ${crop.criticalCare}.`,
        priority: 'medium',
        completed: false
      });
    });

    // Monitoring events
    suggestions.push({
      title: `Monitor ${cropName} for pests`,
      type: 'monitoring',
      crop: cropName,
      date: new Date(startTime + (15 * dayInMs)),
      description: `Start pest monitoring. ${crop.pestMonitoring}`,
      priority: 'medium',
      completed: false
    });

    // Disease prevention
    suggestions.push({
      title: `Disease prevention for ${cropName}`,
      type: 'prevention',
      crop: cropName,
      date: new Date(startTime + (parseInt(crop.germination) + parseInt(crop.vegetativeGrowth) - 5) * dayInMs),
      description: `Apply preventive measures. Disease-prone period: ${crop.diseaseProne}`,
      priority: 'high',
      completed: false
    });

    // Harvest event
    const harvestDays = parseInt(crop.harvest[0].split(' ')[0]);
    suggestions.push({
      title: `Harvest ${cropName}`,
      type: 'harvest',
      crop: cropName,
      date: new Date(startTime + (harvestDays * dayInMs)),
      description: `Ready for harvest. Total growing season: ${crop.totalSeason} days.`,
      priority: 'high',
      completed: false
    });

    return suggestions;
  };

  const addSuggestedEvents = (cropName: string, startDate: Date) => {
    const suggestions = suggestEventsForCrop(cropName, startDate);
    const newEvents: CalendarEvent[] = suggestions.map(event => ({
      ...event,
      id: Date.now().toString() + Math.random()
    }));
    setEvents([...events, ...newEvents]);
  };

  const toggleEventComplete = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      planting: 'bg-green-100 text-green-800',
      harvest: 'bg-orange-100 text-orange-800',
      treatment: 'bg-red-100 text-red-800',
      prevention: 'bg-blue-100 text-blue-800',
      monitoring: 'bg-purple-100 text-purple-800',
      fertilizer: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-l-green-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-red-500'
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-500';
  };

  const { daysInMonth, startingDay } = getDaysInMonth(selectedMonth);

  const showPlantingSeasonInfo = (cropName: string) => {
    const crop = cropData[cropName as keyof typeof cropData];
    if (!crop) return;

    const infoDiv = document.getElementById('plantingSeasonInfo');
    const seasonSpan = document.getElementById('seasonInfo');
    
    if (infoDiv && seasonSpan) {
      seasonSpan.textContent = crop.planting.join(', ');
      infoDiv.classList.remove('hidden');
    }
  };

  const navigateToCropDate = (cropName: string, plantingDate: Date) => {
    // Navigate calendar to the planting month
    setSelectedMonth(new Date(plantingDate.getFullYear(), plantingDate.getMonth()));
    
    // Add the crop season to show the shading
    addCropSeason(cropName, plantingDate);
    
    // Clear the form
    const cropSelect = document.getElementById('quickCropSelect') as HTMLSelectElement;
    const dateInput = document.getElementById('quickPlantingDate') as HTMLInputElement;
    if (cropSelect) cropSelect.value = '';
    if (dateInput) {
      dateInput.value = '';
      dateInput.setCustomValidity('');
    }
    
    // Hide planting season info
    const infoDiv = document.getElementById('plantingSeasonInfo');
    if (infoDiv) infoDiv.classList.add('hidden');
  };

  const previewCropSeason = (cropName: string, plantingDate: Date) => {
    // Navigate calendar to the planting month
    setSelectedMonth(new Date(plantingDate.getFullYear(), plantingDate.getMonth()));
    
    // Temporarily add the crop season for preview (will be replaced when confirmed)
    const tempSeason = createCropSeason(cropName, plantingDate);
    setCropSeasons(prev => {
      // Remove any existing preview seasons for this crop
      const filtered = prev.filter(s => s.id !== 'preview-' + cropName);
      return [...filtered, { ...tempSeason, id: 'preview-' + cropName }];
    });
  };

  const createCropSeason = (cropName: string, plantingDate: Date) => {
    const crop = cropData[cropName as keyof typeof cropData];
    if (!crop) return null;

    const startTime = plantingDate.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    const totalDays = parseInt(crop.totalSeason);
    const endDate = new Date(startTime + (totalDays * dayInMs));
    const harvestDays = parseInt(crop.harvest[0].split(' ')[0]);
    const harvestDate = new Date(startTime + (harvestDays * dayInMs));

    const growthStages = crop.growthStages.map(stage => {
      const [name, days] = stage.split(' (');
      const [startDay, endDay] = days.replace('d)', '').split('-').map(d => parseInt(d));
      return { name, startDay, endDay };
    });

    return {
      id: Date.now().toString(),
      crop: cropName,
      startDate: plantingDate,
      endDate: endDate,
      plantingDate: plantingDate,
      harvestDate: harvestDate,
      growthStages,
      totalDays
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md px-3 h-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black mx-auto text-center select-none transition-transform active:scale-95 mb-2 mt-2">Crop Calendar</h1>
          <div className="w-16" /> {/* Spacer to balance layout */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Controls Card */}
        <div className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-green-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg></span>
            <Select
              value={selectedCrop}
              onValueChange={(value) => {
                setSelectedCrop(value);
                showPlantingSeasonInfo(value);
                setCropSeasons(prev => prev.filter(s => !s.id.startsWith('preview-')));
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Crop..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(cropData).map(crop => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: Date | undefined) => {
                    setSelectedDate(date);
                    if (date && selectedCrop) {
                      const crop = cropData[selectedCrop as keyof typeof cropData];
                      if (crop && isValidPlantingDate(crop, date)) {
                        previewCropSeason(selectedCrop, date);
                      }
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!selectedCrop || !selectedDate) {
                alert('Please select both crop and planting date');
                return;
              }
              const crop = cropData[selectedCrop as keyof typeof cropData];
              if (!crop) return;
              if (!isValidPlantingDate(crop, selectedDate)) {
                alert(`Planting should be in: ${crop.planting.join(', ')}`);
                return;
              }
              addCropSeason(selectedCrop, selectedDate);
              setSelectedCrop("");
              setSelectedDate(undefined);
              setCropSeasons(prev => prev.filter(s => !s.id.startsWith('preview-')));
              const infoDiv = document.getElementById('plantingSeasonInfo');
              if (infoDiv) infoDiv.classList.add('hidden');
            }}
            className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-all duration-150"
          >
            Find Crop Season
          </Button>
        </div>
        <div id="plantingSeasonInfo" className="hidden mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Planting Season:</strong> <span id="seasonInfo"></span>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 min-h-[40vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getMonthName(selectedMonth)}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-32 bg-gray-50 rounded"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
              const dayEvents = getEventsForDate(date);
              const dayCropSeasons = getCropSeasonsForDate(date);
              const filteredEvents = dayEvents;
              const isToday = (() => {
                const now = new Date();
                return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              })();
              const getBackgroundStyle = () => {
                if (dayCropSeasons.length === 0) return 'bg-white';
                const season = dayCropSeasons[0];
                const baseColor = getCropSeasonColor(season.crop).split(' ')[0];
                const opacity = getCropSeasonOpacity(date, season);
                return `${baseColor} ${opacity}`;
              };
              return (
                <div
                  key={i}
                  className={`h-32 border border-gray-200 rounded-xl p-1 relative transition hover:shadow-lg hover:z-10 ${getBackgroundStyle()} ${isToday ? 'ring-2 ring-green-400' : ''}`}
                >
                  <div className={`text-sm font-bold mb-1 ${isToday ? 'text-green-700' : 'text-gray-900'}`}>{i + 1}</div>
                  {dayCropSeasons.length > 0 && (
                    <div className="mb-1">
                      {dayCropSeasons.map(season => (
                        <div
                          key={season.id}
                          className="text-xs font-medium text-gray-700 bg-white/90 px-1 py-0.5 rounded shadow-sm border border-gray-200"
                        >
                          {season.crop}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1">
                    {filteredEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${getEventTypeColor(event.type)} ${event.completed ? 'opacity-50 line-through' : ''} transition hover:bg-gray-100`}
                        onClick={() => toggleEventComplete(event.id)}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {filteredEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{filteredEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crop Duration Legend */}
        {cropSeasons.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Crop Duration Legend</h3>
            <div className="flex flex-col md:flex-row md:gap-0 gap-8">
              {/* Crop Colors Section */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col items-start mb-4 md:mb-0 md:mr-8 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-4 text-base">Crop Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(cropData).map(crop => (
                    <span key={crop} className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold shadow ${getCropSeasonColor(crop)} bg-opacity-90 border border-gray-200`}>{crop}</span>
                  ))}
                </div>
              </div>
              {/* Divider for desktop */}
              <div className="hidden md:block w-px bg-gray-200 mx-6" />
              {/* Growth Stage Opacity Section */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col items-start shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-4 text-base">Growth Stage Opacity</h4>
                <div className="flex flex-col gap-4 w-full">
                  {(() => {
                    let legendCrop = null;
                    if (selectedCrop && cropData[selectedCrop]) legendCrop = selectedCrop;
                    if (!legendCrop && cropSeasons.length > 0) legendCrop = cropSeasons[cropSeasons.length-1].crop;
                    if (!legendCrop) legendCrop = 'Tomato';
                    const baseColor = getCropSeasonColor(legendCrop).split(' ')[0];
                    return [
                      <div key="germ" className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full ${baseColor} opacity-50 border-2 border-gray-300 shadow-sm`}></span><span className="font-medium text-gray-700">Germination</span></div>,
                      <div key="veg" className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full ${baseColor} opacity-70 border-2 border-gray-300 shadow-sm`}></span><span className="font-medium text-gray-700">Vegetative</span></div>,
                      <div key="flow" className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full ${baseColor} opacity-85 border-2 border-gray-300 shadow-sm`}></span><span className="font-medium text-gray-700">Flowering</span></div>,
                      <div key="fruit" className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full ${baseColor} opacity-95 border-2 border-gray-300 shadow-sm`}></span><span className="font-medium text-gray-700">Fruiting</span></div>
                    ];
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Calendar Event</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addEvent({
                title: formData.get('title') as string,
                type: formData.get('type') as any,
                crop: formData.get('crop') as string,
                date: new Date(formData.get('date') as string),
                description: formData.get('description') as string,
                priority: formData.get('priority') as any,
                completed: false
              });
            }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    name="type"
                    required
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="planting">Planting</option>
                    <option value="harvest">Harvest</option>
                    <option value="treatment">Treatment</option>
                    <option value="prevention">Prevention</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="fertilizer">Fertilizer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <select
                    name="crop"
                    required
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {Object.keys(cropData).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    style={{ minHeight: 60 }}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendar; 