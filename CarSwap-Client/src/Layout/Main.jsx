import { Outlet } from "react-router-dom";
import Navbar from "../Components/SharedComponets/Navbar";
import Footer from "../Components/SharedComponets/Footer";


const Main = () => {
    return (
        <div className="font-lancelot ">
            <Navbar/>
            <Outlet></Outlet>
            <Footer/>
        </div>
    );
};

export default Main;