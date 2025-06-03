import CTASection from "../Components/HomeComponents/CTASection";
import FeaturesSection from "../Components/HomeComponents/FeaturesSection";
import HeroSection from "../Components/HomeComponents/HeroSection";
import PopularCars from "../Components/HomeComponents/PopularCars";


const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection/>
      <FeaturesSection/>
      <PopularCars/>
      <CTASection/>   
    </div>
  );
};

export default Home;