import { Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
const PopularCars = () => {
  const popularCars = [
    {
      id: 1,
      name: "Tesla Model 3",
      image: "/api/placeholder/400/300",
      price: "75",
      rating: 4.9,
      location: "New York",
      owner: "John Doe",
    },
    {
      id: 2,
      name: "BMW 3 Series",
      image: "/api/placeholder/400/300",
      price: "65",
      rating: 4.8,
      location: "Los Angeles",
      owner: "Jane Smith",
    },
    {
      id: 3,
      name: "Toyota Camry",
      image: "/api/placeholder/400/300",
      price: "45",
      rating: 4.7,
      location: "Chicago",
      owner: "Mike Johnson",
    },
  ];

   const navigate = useNavigate();

  const handleBooking = (carId) => {
    navigate(`/booking/${carId}`);
  };

  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');


  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold text-gray-900">Featured Rides</h2>
            <div className="h-1 w-20 bg-teal-500 mt-4 rounded-full"></div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ x: 5 }}>
            <Link
              to="/cars"
              className="text-teal-500 hover:text-teal-600 flex items-center gap-1 text-lg"
            >
              Explore All <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularCars.map((car, index) => (
            <motion.div
              key={car.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{car.name}</h3>
                    <p className="text-gray-500">{car.location}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-gray-600">{car.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-teal-500">
                    ${car.price}
                    <span className="text-sm text-gray-500">/day</span>
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                     onClick={() => navigate(`/booking/${generateSlug(car.name)}`)}
                    className="bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    Book Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default PopularCars;
