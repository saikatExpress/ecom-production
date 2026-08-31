import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from '../../../hooks/useTitle';

const Section = () => {
    // Hook
    useTitle("All Sections");

    // Variable
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();

    return (
        <>
            
        </>
    );
};

export default Section;