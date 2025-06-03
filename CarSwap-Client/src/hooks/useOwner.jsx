import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuth from './useAuth';

const useOwner = () => {
    const { user } = useAuth();

    const { data: isOwner, isLoading: isOwnerLoading } = useQuery({
        queryKey: [user?.email, 'isOwner'],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:9000/users/owner/${user?.email}`);
            return res.data?.owner;
        },
        enabled: !!user?.email
    });
    
    return [isOwner, isOwnerLoading];
};

export default useOwner;