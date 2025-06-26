import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Droplet, TrendingUp, RotateCw, Bug, Smartphone, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  route: string;
  hasSplineBackground?: boolean;
  video?: string;
}

const services: Service[] = [
  {
    icon: Leaf,
    title: 'Crop Recommendation',
    description: 'AI-powered crop suggestions based on soil conditions, climate data, and market trends.',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop',
    route: '/crop-recommendation'
  },
  {
    icon: Leaf,
    title: 'Fertilizer Recommendation',
    description: 'Optimize nutrient management with personalized fertilizer recommendations.',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&h=600&fit=crop',
    route: '/fertilizer-recommendation'
  },
  {
    icon: TrendingUp,
    title: 'Yield Prediction',
    description: 'Forecast crop yields using machine learning and historical data analysis.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    route: '/yield-prediction'
  },
  {
    icon: RotateCw,
    title: 'Crop Rotation Planner',
    description: 'Smart rotation planning to maintain soil health and maximize productivity.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop',
    route: '/crop-rotation'
  },
  {
    icon: Bug,
    title: 'Pest & Disease Prediction',
    description: 'Early detection and prevention strategies for common agricultural threats.',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop',
    route: '/pest-disease'
  },
  {
    icon: Droplet,
    title: 'Irrigation Advice',
    description: 'Water management optimization based on crop needs and weather patterns.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    hasSplineBackground: true,
    route: '/irrigation-advice',
    video: '/vid1.mp4'
  },
  {
    icon: Upload,
    title: 'Image Upload',
    description: 'Upload crop images for AI-powered disease detection and analysis.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop',
    route: '/image-upload'
  },
  {
    icon: Leaf,
    title: 'Government Scheme Notifier',
    description: 'Stay updated with relevant agricultural subsidies and support programs.',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop',
    route: '/government-schemes'
  }
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleServiceClick = (service: Service) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to access our services.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    navigate(service.route);
  };

  return (
    <section id="services" className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6">
            Our Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Comprehensive AI-powered solutions for modern agriculture
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.title}
                className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleServiceClick(service)}
              >
                {service.video ? (
                  <video
                    className="w-full h-48 object-cover"
                    autoPlay
                    loop={false}
                    muted
                    onEnded={(e) => (e.target as HTMLVideoElement).pause()}
                  >
                    <source src={service.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 bg-white">
                  <IconComponent className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
