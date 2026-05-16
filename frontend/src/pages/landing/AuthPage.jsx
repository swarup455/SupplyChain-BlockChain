import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, selectAuthLoading, selectAuthError } from "../../redux/authSlice"
import {
    ArrowLeft, Loader2, Mail, Lock, ShieldCheck,
    Eye, EyeOff, ChevronDown, Truck, Factory,
    Store, Package, Crown, Briefcase,
    User
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getRoleRoute } from "../../utils/getRoleRoute"
import { toast } from "react-toastify"

const ROLES = [
    { value: "supplier", label: "Supplier", icon: Package, color: "bg-orange-50 text-orange-500 border-orange-100" },
    { value: "manufacturer", label: "Manufacturer", icon: Factory, color: "bg-blue-50 text-blue-500 border-blue-100" },
    { value: "distributor", label: "Distributor", icon: Truck, color: "bg-violet-50 text-violet-500 border-violet-100" },
    { value: "retailer", label: "Retailer", icon: Store, color: "bg-emerald-50 text-emerald-500 border-emerald-100" },
    { value: "admin", label: "Admin", icon: Crown, color: "bg-rose-50 text-rose-500 border-rose-100" },
]

export default function AuthPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loading = useSelector(selectAuthLoading)
    const { login: loginError } = useSelector(selectAuthError)

    const [formData, setFormData] = useState({ userId: "", password: "", role: "" })
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const user = await dispatch(loginUser({
                userId: formData.userId,
                password: formData.password,
                role: formData.role
            })).unwrap()

            toast.success("Signed in successfully!")
            navigate(getRoleRoute(user.role))
        } catch (err) {
            // error handled by useEffect
        }
    }

    useEffect(() => {
        if (loginError) toast.error(loginError)
    }, [loginError])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">

            <div className="relative w-full max-w-xl md:max-w-3xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="group flex items-center gap-2 mb-5 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors w-fit"
                >
                    <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
                        <ArrowLeft size={13} />
                    </span>
                    Back to Home
                </button>

                <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.07)] overflow-hidden">
                    {/* Top accent stripe */}
                    <div className="h-1 mb-5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />

                    <div className="flex">
                        {/* ── Left Panel ── */}
                        <div className="w-[220px] shrink-0 bg-white border-r border-gray-100 hidden md:flex flex-col px-5 py-8">
                            {/* Logo */}
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                                    <ShieldCheck size={14} className="text-white" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-gray-900">Trackchain</span>
                            </div>

                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                                Access Roles
                            </p>

                            {/* Role Tabs */}
                            <div className="flex flex-col gap-2">
                                {ROLES.map(({ value, label, icon: Icon, color }) => (
                                    <div
                                        key={value}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium ${color}`}
                                    >
                                        <Icon size={14} className="shrink-0" />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom trust indicators */}
                            <div className="mt-auto pt-6">
                                <div className="flex flex-col gap-2.5">
                                    {[
                                        { icon: <ShieldCheck size={12} />, label: "Blockchain secured" },
                                        { icon: <Lock size={12} />, label: "End-to-end encrypted" },
                                        { icon: <Briefcase size={12} />, label: "Role-based access" },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center gap-2 text-gray-400">
                                            {s.icon}
                                            <span className="text-[11px]">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right Panel ── */}
                        <div className="flex-1 flex flex-col">
                            <div className="px-9 pt-8 pb-9">

                                {/* Heading */}
                                <div className="mb-7">
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                                        Sign in to your workspace
                                    </h1>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Access your supply chain dashboard and monitor assets in real time.
                                    </p>
                                </div>

                                <form className="space-y-4" onSubmit={handleSubmit}>

                                    {/* userId */}
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                                            User Id
                                        </label>
                                        <div className="relative flex items-center">
                                            <User size={14} className="absolute left-3.5 text-gray-300 pointer-events-none" />
                                            <input
                                                type="userId"
                                                name="userId"
                                                value={formData.userId}
                                                onChange={handleChange}
                                                placeholder="US001"
                                                required
                                                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-gray-50/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Role
                                        </label>
                                        <div className="relative flex items-center">
                                            <Briefcase size={14} className="absolute left-3.5 text-gray-300 pointer-events-none z-10" />
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none bg-gray-50/50 cursor-pointer"
                                            >
                                                <option value="" disabled>Select your role</option>
                                                {ROLES.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={13} className="absolute right-3.5 text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                                            Password
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock size={14} className="absolute left-3.5 text-gray-300 pointer-events-none" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-gray-50/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className="absolute right-3 text-gray-300 hover:text-gray-500 transition-colors p-0.5"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading.login}
                                        className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-100"
                                    >
                                        {loading.login
                                            ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                                            : "Sign In"
                                        }
                                    </button>
                                </form>

                                {/* Trust badges */}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-6">
                                        {[
                                            { icon: <ShieldCheck size={13} />, label: "Blockchain secured" },
                                            { icon: <Lock size={13} />, label: "Encrypted" },
                                            { icon: <Briefcase size={13} />, label: "Role-based access" },
                                        ].map(s => (
                                            <div key={s.label} className="flex items-center gap-1.5 text-gray-300">
                                                {s.icon}
                                                <span className="text-[11px] font-medium">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div className="flex justify-center gap-5 mt-5">
                    {["Support", "Privacy", "System Status"].map(l => (
                        <a key={l} href="#" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">{l}</a>
                    ))}
                </div>

            </div>
        </div>
    )
}