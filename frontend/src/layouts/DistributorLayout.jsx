import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import Loader from "../components/loaders/FullPageSpinner";
import { selectUser, selectAuthLoading } from "../redux/authSlice"

const DistributorLayout = () => {
    const user = useSelector(selectUser);
    
    const { profile } = useSelector(selectAuthLoading);
    if (profile) return <Loader />;

    if (!user) return <Navigate to="/" replace />;
    if (user.role !== "distributor") return <Navigate to="/" replace />;

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default DistributorLayout;