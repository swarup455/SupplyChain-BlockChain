import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const ManufacturerDashboard = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

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
                            Manufacturer Dashboard
                        </h1>

                        <p className="text-gray-400 mt-1">
                            Manage production and manufacturing workflow
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
                            Receive Materials
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            View incoming raw materials from suppliers.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            View Materials
                        </button>

                    </div>

                    {/* Card 2 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Create Products
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            Add manufacturing details to blockchain.
                        </p>

                        <button className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded-xl text-black font-medium">
                            Create Product
                        </button>

                    </div>

                    {/* Card 3 */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500 transition">

                        <h2 className="text-lg font-medium text-emerald-400 mb-2">
                            Production Records
                        </h2>

                        <p className="text-sm text-gray-400 mb-4">
                            Track manufacturing blockchain history.
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

export default ManufacturerDashboard;