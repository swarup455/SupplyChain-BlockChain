import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const RetailerDashboard = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {

        await dispatch(logoutUser());
        navigate("/");

    };

    return (

        <div className="min-h-screen bg-black text-white p-6">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between mb-8">

                    <div>
                        <h1 className="text-3xl font-semibold text-emerald-400">
                            Retailer Dashboard
                        </h1>

                        <p className="text-gray-400 mt-1">
                            Manage inventory and product sales
                        </p>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="h-13 flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-emerald-400 hover:bg-zinc-800 px-4 py-2 rounded-2xl transition duration-200"
                    >
                        Logout
                    </button>

                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Card 1 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Inventory
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            View available stock and product details.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            View Inventory
                        </button>

                    </div>

                    {/* Card 2 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Mark as Sold
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            Update product sale status on blockchain.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            Update Sales
                        </button>

                    </div>

                    {/* Card 3 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Sales Records
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            View blockchain transaction history.
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

export default RetailerDashboard;