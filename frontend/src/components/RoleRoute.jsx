import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const roleRoutes = {
    supplier: "/supplier-dashboard",
    manufacturer: "/manufacturer-dashboard",
    distributor: "/distributor-dashboard",
    retailer: "/retailer-dashboard"
};

const RoleRoute = ({ children, role }) => {

    const { user } = useSelector(state => state.auth);

    // Not logged in → go auth page
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Logged in but wrong role → redirect to correct dashboard
    if (user.role !== role) {
        return <Navigate to={roleRoutes[user.role] || "/"} replace />;
    }

    return children;
};

export default RoleRoute;