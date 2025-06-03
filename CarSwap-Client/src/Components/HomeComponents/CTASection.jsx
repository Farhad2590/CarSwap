import { motion } from 'framer-motion';

const CTASection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-teal-500 to-teal-700 py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Start Your Luxury Journey Today
        </motion.h2>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-teal-500 px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors font-semibold"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTASection;
