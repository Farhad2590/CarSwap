import { motion } from "framer-motion";
import { Shield, Clock, CreditCard } from "lucide-react";
const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="py-32 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Premium Experience
          </h2>
          <div className="h-1 w-20 bg-teal-500 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Verified Users",
              desc: "Thoroughly vetted community of car enthusiasts",
            },
            {
              icon: Clock,
              title: "Flexible Rentals",
              desc: "Rent exotic cars by the hour or day",
            },
            {
              icon: CreditCard,
              title: "Secure Payments",
              desc: "Protected transactions with instant booking",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
