import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const MotivationSection = () => {
  return (
    <section id="motivation-section" className="bg-white flex items-center py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-12">
            Our Motivation
          </h2>
          
          <Card className="border-0 shadow-2xl bg-white relative z-10">
            <CardContent className="p-12 bg-white relative z-10">
              <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic font-light">
                "SeedSync was born from a simple, powerful vision — to bridge the gap between 
                technology and agriculture. In an era where data drives progress, we believe our 
                farmers deserve intelligent tools that are not just powerful but practical.
                <br /><br />
                We're not just building features — we're building a future where every farm, 
                big or small, grows smarter."
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">
                    — Ansh Johnson
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Founder, SeedSync
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default MotivationSection;
