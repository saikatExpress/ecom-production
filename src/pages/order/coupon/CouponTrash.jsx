import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from '../../../hooks/useTitle';

const CouponTrash = () => {
    // Hook
    useTitle('Coupon Trash List');

    // Variable
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();

    return (
        <div>
            
        </div>
    );
};

export default CouponTrash;