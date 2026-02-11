import React, { useState } from "react";

const VerifyProduct = () => {

    const [productId, setProductId] = useState("");

    const handleVerify = () => {

        // later call backend API here
        console.log("Verify product:", productId);

    };

    return (

        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">

            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

                {/* Title */}
                <h1 className="text-3xl font-semibold text-emerald-400 mb-2 text-center">
                    Verify Product
                </h1>

                <p className="text-gray-400 text-center mb-8">
                    Enter product ID or scan QR code to verify authenticity.
                </p>

                {/* Input */}
                <input
                    type="text"
                    placeholder="Enter Product ID..."
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-black border border-zinc-700 focus:border-emerald-500 outline-none rounded-xl p-3 mb-6"
                />

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-3 rounded-xl transition"
                >
                    Verify Product
                </button>

            </div>

        </div>

    );
};

export default VerifyProduct;