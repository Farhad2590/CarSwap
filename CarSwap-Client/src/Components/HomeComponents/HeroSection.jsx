import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative bg-gradient-to-r from-teal-500 to-teal-700 py-32"
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="text-center space-y-8">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white"
          >
            Drive Your Dreams
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-2xl text-white/90 max-w-2xl mx-auto"
          >
            Experience luxury cars with our premium car sharing platform
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Where would you like to drive?"
                  className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-teal-600 px-8 py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 font-semibold"
              >
                <Search className="w-5 h-5" />
                Search
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
