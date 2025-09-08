


import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const isAuthenticate = localStorage.getItem('isAuthenticated');

   

    if (!isAuthenticate) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default PrivateRoute;