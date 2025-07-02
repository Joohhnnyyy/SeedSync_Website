import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1000));
      setForm({ name: '', email: '', message: '' });
      setShowSuccessModal(true);
    } catch (err) {
      toast({ title: 'Failed to send message', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-10">
        <motion.section 
          className="py-20 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center mb-16 gap-4 sm:gap-0">
              <Button asChild variant="ghost" className="w-fit mb-2 sm:mb-0">
                <Link to="/" className="flex items-center text-black hover:text-gray-700">
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex-grow text-center">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black mb-4 sm:mb-8">
                  Get in Touch
                </h1>
                <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
                  Have questions about SeedSync? We'd love to hear from you.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="shadow-2xl bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-black">
                      Send us a Message
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-base">Name</Label>
                        <Input 
                          id="name" 
                          type="text" 
                          placeholder="Your full name"
                          className="h-12 bg-gray-100 border-gray-300 placeholder-gray-700 px-4 text-base"
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-base">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Your email address"
                          className="h-12 bg-gray-100 border-gray-300 placeholder-gray-700 px-4 text-base"
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="message" className="text-base">Message</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Tell us how we can help you..."
                          className="min-h-[120px] resize-none bg-gray-100 border-gray-300 placeholder-gray-700 px-4 py-3 text-base"
                          value={form.message}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 bg-black text-white hover:bg-gray-800 mt-4" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Why Contact Us?
                  </h3>
                  <div className="space-y-4 text-gray-600">
                    <p>• Get personalized recommendations for your farm</p>
                    <p>• Learn about upcoming features and updates</p>
                    <p>• Request custom solutions for your agricultural needs</p>
                    <p>• Join our community of innovative farmers</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Response Time
                  </h3>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24 hours. 
                    For urgent farming assistance, please mention it in your message.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Built by Farmers, for Farmers
                  </h3>
                  <p className="text-gray-600">
                    Our team understands the challenges of modern agriculture. 
                    We're here to help you leverage technology for better farming outcomes.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
      
      <Footer />

      {showSuccessModal && (
        <div className="fixed bottom-8 right-8 z-50 flex items-end justify-end">
          <div className="bg-black text-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center animate-slide-in-up">
            <h2 className="text-2xl font-bold mb-2">Thank you for reaching out!</h2>
            <p className="mb-6">We will surely get in touch with you soon.</p>
            <button
              className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
