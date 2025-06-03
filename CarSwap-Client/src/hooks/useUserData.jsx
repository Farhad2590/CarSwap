import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuth from "./useAuth";

const useUserData = () => {
  const { user } = useAuth();

  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ["userData", user?.email],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:9000/users/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const isAdmin =
    userData?.userType === "admin" || userData?.userType === "owner" || userData?.userType === "renter";

  return {
    userData,
    isLoading: isUserDataLoading,
    isAdmin,
    isOwner: userData?.userType,
    isSubscribed: userData?.isSubscribed,
    verificationStatus: userData?.verificationStatus,
  };
};

export default useUserData;
