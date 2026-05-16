import { useState, useEffect } from "react";
import {
    ShieldCheck, LayoutDashboard, Users, Link2, PackageSearch,
    BarChart2, Settings, LogOut, Bell, Search, Plus, Filter,
    Wallet, CheckCircle2, Clock, XCircle, ChevronDown,
    Eye, Pencil, Ban, Trash2, Activity, ArrowUpRight,
    Building2, Mail, Phone, MapPin, Lock, RefreshCw,
    Factory, Truck, Store, Package, Crown, Hash, X, Menu, ChevronRight
} from "lucide-react";
import { logoutUser } from "../../redux/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createStakeholderAPI, deleteStakeholderAPI, getAllStakeholdersAPI, toggleStatusAPI } from "../../services/adminApi";
import { toast } from "react-toastify"
import { selectUser } from "../../redux/authSlice";

const ACTIVITY = [
    { text: "MFG002 account created by Admin", time: "Just now", type: "success" },
    { text: "SUP002 registered — wallet pending", time: "1h ago", type: "warning" },
    { text: "RET001 account suspended by Admin", time: "3h ago", type: "danger" },
    { text: "DIST001 profile updated", time: "5h ago", type: "info" },
    { text: "MFG001 wallet connected: 0xB98D…", time: "8h ago", type: "success" },
    { text: "SUP001 blockchain record created", time: "1d ago", type: "info" },
];

const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stakeholders", label: "Stakeholders", icon: Users },
    { id: "blockchain", label: "Blockchain Records", icon: Link2 },
    { id: "verification", label: "Product Verification", icon: PackageSearch },
    { id: "analytics", label: "System Analytics", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
];

const ROLE_META = {
    supplier: { label: "Supplier", icon: Package, bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
    manufacturer: { label: "Manufacturer", icon: Factory, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    distributor: { label: "Distributor", icon: Truck, bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    retailer: { label: "Retailer", icon: Store, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
};

const STATUS_META = {
    active: { label: "Active", bg: "bg-emerald-50", text: "text-emerald-600" },
    suspended: { label: "Suspended", bg: "bg-red-50", text: "text-red-500" },
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-600" },
};

const EMPTY_FORM = { name: "", company: "", email: "", phone: "", role: "", wallet: "", location: "", password: "" };

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ stat }) {
    const colorMap = {
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
        violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    };
    const c = colorMap[stat.color];
    const Icon = stat.icon;
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${c.bg} ${c.ring}`}>
                    <Icon size={18} className={c.text} />
                </div>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{stat.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stat.delta}</p>
        </div>
    );
}

function RoleBadge({ role }) {
    const m = ROLE_META[role] || {};
    const Icon = m.icon || Package;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
            <Icon size={10} /> {m.label}
        </span>
    );
}

function StatusBadge({ status }) {
    const m = STATUS_META[status] || {};
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "pending" ? "bg-amber-400" : "bg-red-400"}`} />
            {m.label}
        </span>
    );
}

function ActivityDot({ type }) {
    const map = {
        success: "bg-emerald-500",
        warning: "bg-amber-400",
        danger: "bg-red-400",
        info: "bg-indigo-400",
    };
    return <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${map[type]}`} />;
}

function FormField({ label, name, placeholder, icon: Icon, type = "text", form, onChange, children }) {
    return (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
            <div className="relative flex items-center">
                {Icon && <Icon size={13} className="absolute left-3 text-gray-300 pointer-events-none" />}
                {children || (
                    <input
                        type={type} name={name} value={form[name]} onChange={onChange}  // ← use props
                        placeholder={placeholder}
                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-gray-50/60 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                )}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [activeNav, setActiveNav] = useState("stakeholders");
    const [stakeholders, setStakeholders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [showForm, setShowForm] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    const STATS = [
        {
            label: "Total Stakeholders",
            value: String(stakeholders.length),
            delta: "All roles",
            icon: Users,
            color: "indigo"
        },
        {
            label: "Active Manufacturers",
            value: String(stakeholders.filter(s => s.role === "manufacturer" && s.status === "active").length),
            delta: "Active only",
            icon: Factory,
            color: "emerald"
        },
        {
            label: "Connected Wallets",
            value: String(stakeholders.filter(s => s.walletAddress).length),
            delta: "Linked accounts",
            icon: Wallet,
            color: "violet"
        },
        {
            label: "Pending Approvals",
            value: String(stakeholders.filter(s => s.status === "pending").length),
            delta: "Needs action",
            icon: Clock,
            color: "amber"
        },
    ];

    useEffect(() => {
        fetchStakeholders();
    }, []);

    const fetchStakeholders = async () => {
        setLoading(true);
        try {
            const { data } = await getAllStakeholdersAPI();
            setStakeholders(data.stakeholders);
        } catch {
            toast.error("Failed to fetch stakeholders.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    // ── CREATE ────────────────────────────────────────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data } = await createStakeholderAPI({
                name: form.name,
                email: form.email,
                role: form.role,
                phoneNumbers: [form.phoneNumber, form.alternatePhone].filter(Boolean),
                walletAddress: form.wallet,
                location: form.location,
            });
            setStakeholders([data.user, ...stakeholders]);
            setForm(EMPTY_FORM);
            toast.success("Stakeholder created & credentials sent via email!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create stakeholder.");
        } finally {
            setCreating(false);
        }
    };

    // ── SUSPEND / ACTIVATE ────────────────────────────────────────────────────────
    const handleSuspend = async (id) => {
        try {
            const { data } = await toggleStatusAPI(id);
            setStakeholders(stakeholders.map(s =>
                s._id === id ? { ...s, status: data.status } : s
            ));
            toast.success(`Stakeholder ${data.status === "suspended" ? "suspended" : "activated"}.`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status.");
        }
    };

    // ── DELETE ────────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await deleteStakeholderAPI(id);
            setStakeholders(stakeholders.filter(s => s._id !== id));
            setDeleteTarget(null);
            toast.success("Stakeholder deleted successfully.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete stakeholder.");
        }
    };

    const filtered = stakeholders.filter(s => {
        const matchRole = filterRole === "all" || s.role === filterRole;
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s._id.toLowerCase().includes(search.toLowerCase()) ||
            s.location?.toLowerCase().includes(search.toLowerCase())
        return matchRole && matchSearch;
    });

    return (
        <div className="min-h-screen bg-[#f4f4f6] flex flex-col font-sans">

            {/* ── TOPBAR ──────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-5 gap-4 shadow-sm">
                <button className="lg:hidden text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(v => !v)}>
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow shadow-indigo-200">
                        <ShieldCheck size={14} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-base tracking-tight">Trackchain</span>
                    <span className="hidden sm:flex text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full ml-1">Admin</span>
                </div>

                <div className="flex-1" />

                <button className="relative w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </button>

                <div className="hidden sm:flex items-center gap-2 border border-gray-100 bg-gray-50 rounded-xl px-3 py-1.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Crown size={11} className="text-indigo-600" />
                    </div>
                    <div className="leading-tight">
                        <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-[10px] text-gray-400">{user?.email}</p>
                    </div>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-colors">
                    <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
                </button>
            </nav>

            <div className="flex flex-1 overflow-hidden">

                {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto px-5 py-7 lg:px-8">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full mb-2">
                                <Users size={10} /> Stakeholder Management
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Supply Chain Participants</h1>
                            <p className="text-sm text-gray-400 mt-1">Create and oversee verified blockchain stakeholders across all roles.</p>
                        </div>
                        <button
                            onClick={() => setShowForm(v => !v)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-100 shrink-0"
                        >
                            {showForm ? <X size={15} /> : <Plus size={15} />}
                            {showForm ? "Hide Form" : "Create Stakeholder"}
                        </button>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
                        {STATS.map(s => <StatCard key={s.label} stat={s} />)}
                    </div>

                    <div className="grid xl:grid-cols-[1fr_300px] gap-6">
                        <div className="flex flex-col gap-6 min-w-0">

                            {/* ── Create Form ─────────────────────────────── */}
                            {showForm && (
                                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h2 className="text-base font-bold text-gray-900">Create New Stakeholder</h2>
                                                <p className="text-xs text-gray-400 mt-0.5">Account will be registered on the blockchain network.</p>
                                            </div>
                                            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                                                <ShieldCheck size={16} className="text-indigo-600" />
                                            </div>
                                        </div>

                                        <form onSubmit={handleCreate}>
                                            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                                <FormField form={form} onChange={handleFormChange} label="Full Name" name="name" placeholder="e.g. Arjun Mehta" icon={Users} />
                                                <FormField form={form} onChange={handleFormChange} label="Company Name" name="company" placeholder="e.g. Himalayan Timber Co." icon={Building2} />
                                                <FormField form={form} onChange={handleFormChange} label="Email Address" name="email" placeholder="name@company.com" icon={Mail} type="email" />
                                                <FormField form={form} onChange={handleFormChange} label="Phone Number" name="phone" placeholder="+91 98765 43210" icon={Phone} />
                                                <FormField form={form} onChange={handleFormChange} label="Alternative Phone Number(Optional)" name="alternatePhone" placeholder="+91 88765 53240" icon={Phone} />

                                                <FormField form={form} onChange={handleFormChange} label="Role" name="role" icon={Crown}>
                                                    <select
                                                        name="role" value={form.role} onChange={handleFormChange} required
                                                        className="w-full pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50/60 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 appearance-none transition-all"
                                                    >
                                                        <option value="">Select role</option>
                                                        <option value="supplier">Supplier</option>
                                                        <option value="manufacturer">Manufacturer</option>
                                                        <option value="distributor">Distributor</option>
                                                        <option value="retailer">Retailer</option>
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-3 text-gray-300 pointer-events-none" />
                                                </FormField>

                                                <FormField form={form} onChange={handleFormChange} label="Wallet Address (optional)" name="wallet" placeholder="0x1a2b3c…" icon={Wallet} />
                                                <FormField form={form} onChange={handleFormChange} label="Business Location" name="location" placeholder="e.g. Kolkata, WB" icon={MapPin} />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={creating}
                                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
                                                >
                                                    {creating ? (
                                                        <>
                                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                            </svg>
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <><ShieldCheck size={14} /> Create Account</>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(EMPTY_FORM)}
                                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                                                >
                                                    <RefreshCw size={13} /> Reset
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* ── Stakeholder Table ────────────────────────── */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                {/* Table Header */}
                                <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">Stakeholder Registry</h2>
                                        <p className="text-[11px] text-gray-400">{filtered.length} participants found</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="relative">
                                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                value={search} onChange={e => setSearch(e.target.value)}
                                                placeholder="Search ID, name, company…"
                                                className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 w-48 transition-all"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <select
                                                value={filterRole} onChange={e => setFilterRole(e.target.value)}
                                                className="pl-7 pr-7 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="all">All Roles</option>
                                                <option value="supplier">Supplier</option>
                                                <option value="manufacturer">Manufacturer</option>
                                                <option value="distributor">Distributor</option>
                                                <option value="retailer">Retailer</option>
                                            </select>
                                            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[820px]">
                                        <thead>
                                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                                {["ID", "Stakeholder", "Role", "Email", "Status", "Wallet", "Joined", "Actions"].map(h => (
                                                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3 whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                                                        No stakeholders found.
                                                    </td>
                                                </tr>
                                            ) : filtered.map(s => (
                                                <tr key={s._id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-semibold">{s.userId}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-xs font-semibold text-gray-900">{s.name}</p>
                                                        <p className="text-[11px] text-gray-400">{s.company}</p>
                                                    </td>
                                                    <td className="px-4 py-3"><RoleBadge role={s.role} /></td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{s.email}</td>
                                                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.wallet ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                                                            <Wallet size={9} />
                                                            {s.walletAddress ? "Connected" : "Not linked"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                                                        {new Date(s.createdAt).toLocaleDateString("en-GB", {
                                                            day: "2-digit", month: "short", year: "numeric"
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View">
                                                                <Eye size={13} />
                                                            </button>
                                                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Edit">
                                                                <Pencil size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSuspend(s._id)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Suspend/Activate"
                                                            >
                                                                <Ban size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget(s)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-[11px] text-gray-400">Showing {filtered.length} of {stakeholders.length} stakeholders</p>
                                    <div className="flex items-center gap-1">
                                        {["Prev", "1", "2", "Next"].map(p => (
                                            <button key={p} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors
                                                ${p === "1" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column ──────────────────────────────────── */}
                        <div className="flex flex-col gap-6">

                            {/* Activity Feed */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
                                        <p className="text-[11px] text-gray-400">Live admin actions</p>
                                    </div>
                                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                                        <Activity size={13} className="text-indigo-500" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3.5">
                                    {ACTIVITY.map((a, i) => (
                                        <div key={i} className="flex gap-3 group">
                                            <ActivityDot type={a.type} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] text-gray-700 leading-snug">{a.text}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Role Breakdown */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-900 mb-1">Role Breakdown</h2>
                                <p className="text-[11px] text-gray-400 mb-4">Distribution across supply chain</p>
                                {Object.entries(ROLE_META).map(([role, meta]) => {
                                    const count = stakeholders.filter(s => s.role === role).length;
                                    const pct = stakeholders.length ? Math.round((count / stakeholders.length) * 100) : 0;
                                    const Icon = meta.icon;
                                    return (
                                        <div key={role} className="mb-3 last:mb-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${meta.bg}`}>
                                                        <Icon size={11} className={meta.text} />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-500">{count} · {pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${role === "supplier" ? "bg-orange-400" : role === "manufacturer" ? "bg-blue-400" : role === "distributor" ? "bg-violet-400" : "bg-emerald-400"}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quick Info */}
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck size={16} />
                                    <span className="text-sm font-bold">Blockchain Security</span>
                                </div>
                                <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                                    All stakeholder accounts are cryptographically secured. Ownership transfers require smart contract validation.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Smart Contract", val: "Active" },
                                        { label: "Network", val: "Ganache" },
                                        { label: "Total Blocks", val: "4,891" },
                                        { label: "Tx Success", val: "100%" },
                                    ].map(item => (
                                        <div key={item.label} className="bg-white/10 rounded-xl px-3 py-2">
                                            <p className="text-[9px] text-indigo-300 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-xs font-bold mt-0.5">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Delete Confirmation Modal ──────────────────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={20} className="text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Delete Stakeholder</h3>
                        <p className="text-sm text-gray-400 text-center mb-6">
                            Are you sure you want to permanently remove <span className="font-semibold text-gray-700">{deleteTarget?.name}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget._id)}
                                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}