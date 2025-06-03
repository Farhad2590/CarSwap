import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAuth from './useAuth';

const useAdmin = () => {
    const { user } = useAuth();

    const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        queryFn: async () => {
            const res = await axios.get(`http://localhost:9000/users/admin/${user?.email}`);
            return res.data?.admin;
        },
        enabled: !!user?.email
    });
    
    return [isAdmin, isAdminLoading];
};

export default useAdmin;