import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuth from './useAuth';

const useRenter = () => {
    const { user } = useAuth();

    const { data: isRenter, isLoading: isRenterLoading } = useQuery({
        queryKey: [user?.email, 'isRenter'],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:9000/users/renter/${user?.email}`);
            return res.data?.renter;
        },
        enabled: !!user?.email
    });
    
    return [isRenter, isRenterLoading];
};

export default useRenter;