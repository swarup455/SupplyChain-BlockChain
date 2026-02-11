import React from 'react';
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"

const SupplierDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            dispatch(logoutUser());
            // Redirect to auth page
            navigate("/");

        } catch (error) {
            toast.error("Logout failed", error);
        }
    };
    return (

        <div className="min-h-screen bg-black text-white py-8 px-6">

            {/* Container */}
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between mb-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-emerald-400">
                            Supplier Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage raw materials and supply chain activities
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="h-13 cursor-pointer flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-emerald-400 hover:bg-zinc-800 px-4 py-2 rounded-2xl transition duration-200"
                    >
                        Logout
                    </button>
                </div>


                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Card 1 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Add Raw Material
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            Register new materials into blockchain supply chain.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            Add Material
                        </button>

                    </div>

                    {/* Card 2 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Active Batches
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            View current material batches in supply chain.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            View Batches
                        </button>

                    </div>

                    {/* Card 3 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Blockchain Records
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            Track verified transactions on blockchain.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            View Records
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default SupplierDashboard;