import { useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';

const Blog = () => {
    // Hook
    useTitle("All Blogs");

    // Variable
    const navigate = useNavigate();
    
    return (
        <>
            
        </>
    );
};

export default Blog;