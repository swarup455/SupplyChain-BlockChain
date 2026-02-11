import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, signupUser } from "../redux/authSlice"
import { LoaderCircle } from "lucide-react"

export default function AuthPage() {
    const dispatch = useDispatch();
    const [isLogin, setIsLogin] = useState(true);
    const { loading } = useSelector(state => state.auth);
      
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            dispatch(loginUser({
                email: formData.email,
                password: formData.password
            }));
        } else {
            dispatch(signupUser(formData));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900/40 to-black/70 backdrop-blur-md px-4">
            <div className="w-full max-w-138 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl shadow-xl p-10">

                {/* Title */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold text-white">
                        {isLogin ? "Login to your account" : "Create new account"}
                    </h2>

                    <p className="text-white/60 text-sm mt-1">
                        {isLogin
                            ? "Enter your credentials to continue"
                            : "Register to start tracking supply chain"}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex mb-8 bg-white/10 rounded-xl p-1">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`w-1/2 py-2 rounded-lg font-medium transition
                        ${isLogin ? "bg-emerald-500 text-white" : "text-white/70"}`}
                    >
                        Login
                    </button>

                    <button
                        onClick={() => setIsLogin(false)}
                        className={`w-1/2 py-2 rounded-lg font-medium transition
                        ${!isLogin ? "bg-emerald-500 text-white" : "text-white/70"}`}
                    >
                        Signup
                    </button>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Name (Signup only) */}
                    {!isLogin && (
                        <div>
                            <label className="text-sm text-white/70 mb-1 block">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter name"
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="text-sm text-white/70 mb-1 block">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter Email"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                        />
                    </div>

                    {/* Role Dropdown */}
                    {!isLogin && (
                        <div>
                            <label className="text-sm text-white/70 mb-1 block">
                                Select Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 focus:outline-none focus:border-emerald-400"
                            >
                                <option className="bg-emerald-950" value="">Choose role</option>
                                <option className="bg-emerald-950" value="supplier">Supplier</option>
                                <option className="bg-emerald-950" value="manufacturer">Manufacturer</option>
                                <option className="bg-emerald-950" value="distributor">Distributor</option>
                                <option className="bg-emerald-950" value="retailer">Retailer</option>
                            </select>
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="text-sm text-white/70 mb-1 block">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold cursor-pointer flex items-center justify-center gap-3"
                    >
                        {loading && <LoaderCircle className="animate-spin" />}
                        {isLogin ? "Login" : "Create Account"}
                    </button>

                </form>

            </div>

        </div>
    );
}