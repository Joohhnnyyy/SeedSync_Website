import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  Sprout,
  User,
  MessageCircle,
  Info,
  Bug,
  BarChart2,
  CalendarCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { apiUrl } from '../lib/utils';

const serviceTableMap = [
  { table: 'crop_recommendations', name: 'Crop Recommendation' },
  { table: 'fertilizer_recommendations', name: 'Fertilizer Recommendation' },
  { table: 'yield_predictions', name: 'Yield Prediction' },
  { table: 'crop_rotation_plans', name: 'Crop Rotation Planner' },
  { table: 'pest_disease_predictions', name: 'Pest & Disease Prediction' },
  { table: 'irrigation_advice', name: 'Irrigation Advice' },
  { table: 'government_scheme_checks', name: 'Government Scheme Notifier' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.displayName || 'Farmer';
  // Remove servicesUsed and related logic
  // Add subscription logic
  const [subscription, setSubscription] = useState({ plan: 'Free', features: ['Basic crop recommendations', 'Access to government schemes'], available: [
    { name: 'Free', features: ['Basic crop recommendations', 'Access to government schemes'] },
    { name: 'Pro', features: ['Land registration assistance', 'Advanced AI support'] },
    { name: 'Premium', features: ['All Pro features', 'Priority support', 'Advanced analytics'] },
  ] });

  const handleUpgrade = () => {
    // Placeholder for upgrade logic
    alert('Upgrade flow coming soon!');
  };
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, missing: [] as string[] });

  const fetchProfileCompletion = useCallback(async () => {
    if (!user) return;
    const userId = user.uid;
    try {
      const res = await fetch(apiUrl(`/api/profile/${userId}`));
      if (!res.ok) return;
      const result = await res.json();
      if (!result.success || !result.data) return;
      const data = result.data;
      const fields = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'location', label: 'Farm Location' },
        { key: 'profileImage', label: 'Profile Picture' },
      ];
      const total = fields.length;
      const missing = fields.filter(f => !data[f.key] || (typeof data[f.key] === 'string' && !data[f.key].trim()));
      const percent = Math.round(((total - missing.length) / total) * 100);
      setProfileCompletion({ percent, missing: missing.map(f => f.label) });
    } catch (e) {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchProfileCompletion();
    // Optionally, listen for profile updates via events or polling
  }, [fetchProfileCompletion]);

  useEffect(() => {
    const fetchServicesUsed = async () => {
      if (!user) return;
      // setLoadingServices(true); // Removed
      // const used: string[] = []; // Removed
      for (const { table, name } of serviceTableMap) {
        const { count, error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.uid);
        if (!error && count && count > 0) {
          // used.push(name); // Removed
        }
      }
      // setServicesUsed(used); // Removed
      // setLoadingServices(false); // Removed
    };
    fetchServicesUsed();
  }, [user]);

  const lastLoginRaw = user?.metadata?.lastSignInTime;
  let lastLogin = 'Unknown';
  let lastLoginTooltip = '';
  if (lastLoginRaw) {
    const date = new Date(lastLoginRaw);
    lastLogin = format(date, 'PPpp'); // e.g., Apr 27, 2024 at 10:30 AM
    lastLoginTooltip = date.toString();
  }

  const stats = [
    {
      label: 'Subscription',
      value: `${subscription.plan} Plan`,
      icon: <User className="w-6 h-6 text-purple-600" />,
      tooltip: (
        <div className="min-w-[200px]">
          <div className="font-semibold mb-2">Available Plans</div>
          <ul className="mb-2">
            {subscription.available.map(plan => (
              <li key={plan.name} className="mb-1">
                <span className="font-bold">{plan.name}:</span> {plan.features.join(', ')}
              </li>
            ))}
          </ul>
          <button onClick={handleUpgrade} className="w-full bg-green-600 text-white rounded px-3 py-1 mt-2 hover:bg-green-700 transition">Upgrade</button>
        </div>
      ),
    },
    {
      label: 'Last Login',
      value: lastLogin,
      icon: <CalendarCheck className="w-6 h-6 text-blue-600" />,
      tooltip: lastLoginTooltip || undefined,
    },
    {
      label: 'Profile Completion',
      value: `${profileCompletion.percent}%`,
      icon: <CheckCircle2 className="w-6 h-6 text-yellow-500" />,
      tooltip:
        profileCompletion.percent === 0 ? (
          <span>Please complete your profile.</span>
        ) : profileCompletion.percent === 100 ? (
          <span>Profile completed!</span>
        ) : (
          <div className="min-w-[160px]">
            <div className="font-semibold mb-2">Missing Fields</div>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {profileCompletion.missing.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
        ),
    },
  ];

  const quickActions = [
    { title: 'View Services', path: '/services', icon: <Sprout className="w-10 h-10 text-green-700" /> },
    { title: 'Update Profile', path: '/profile', icon: <User className="w-10 h-10 text-blue-700" /> },
    { title: 'Contact Support', path: '/contact', icon: <MessageCircle className="w-10 h-10 text-purple-700" /> },
    { title: 'About SeedSync', path: '/about', icon: <Info className="w-10 h-10 text-gray-700" /> },
    { title: 'Pest & Disease', path: '/pest-disease', icon: <Bug className="w-10 h-10 text-red-700" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <motion.section
          className="relative py-12 px-6 bg-green-100 rounded-b-3xl shadow-md mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-2 drop-shadow-sm">
                Hello, {userName}!
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-4">
                Welcome to your SeedSync Dashboard. Manage your farming journey with ease.
              </p>
              <Button asChild className="bg-green-700 text-white hover:bg-green-800 shadow-md">
                <Link to="/services">Get Started</Link>
              </Button>
            </div>
            <img
              src="/logo.png"
              alt="SeedSync Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg animate-bounce-slow"
            />
          </div>
        </motion.section>

        {/* Stats Section */}
        <TooltipProvider>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 px-2">
            {stats.map((stat, i) => (
              stat.tooltip ? (
                <Tooltip key={stat.label}>
                  <TooltipTrigger asChild>
                    <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="flex flex-col items-center gap-0 py-8 px-4">
                        <div className="bg-green-100 rounded-full p-3 flex items-center justify-center mb-4">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-black mb-2 text-center break-words">
                          {stat.value}
                        </div>
                        <div className="text-gray-600 text-sm text-center mt-1">
                          {stat.label}
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{stat.tooltip}</TooltipContent>
                </Tooltip>
              ) : (
                <Card key={stat.label} className="bg-white border-0 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="flex flex-col items-center gap-0 py-8 px-4">
                    <div className="bg-green-100 rounded-full p-3 flex items-center justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-black mb-2 text-center break-words">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm text-center mt-1">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TooltipProvider>

        {/* Quick Actions */}
        <motion.section
          className="max-w-6xl mx-auto px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <Link to={action.path}>
                    <Card className="h-full border-0 bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                      <CardContent className="p-6 text-center flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-green-100 group-hover:bg-green-200 transition-all">
                          {action.icon}
                        </div>
                        <h3 className="text-base font-semibold text-black group-hover:text-green-700">
                          {action.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Activity & Getting Started */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-2 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart2 className="w-6 h-6 text-green-700" />
                <CardTitle className="text-2xl font-bold text-black">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-600">
                  <p>• Account created successfully</p>
                  <p>• Welcome to SeedSync!</p>
                  <p>• Explore our services to get started</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center gap-2">
                <Sprout className="w-6 h-6 text-green-700" />
                <CardTitle className="text-2xl font-bold text-black">
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Ready to revolutionize your farming? Start with our AI-powered services.
                  </p>
                  <Button asChild className="w-full bg-green-700 text-white hover:bg-green-800">
                    <Link to="/services">
                      Explore Services
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
