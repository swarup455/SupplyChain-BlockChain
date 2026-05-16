import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import {
    ShieldCheck, Leaf, Truck, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, Trees, MapPin, ChevronRight, Activity,
    Hash, Calendar, User, PackageCheck, FileCheck
} from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const STATS = [
    { label: "Timber Batches Registered", value: "47", sub: "+3 this week", icon: <Trees size={18} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Batches Dispatched", value: "38", sub: "+2 today", icon: <Truck size={18} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Pending Dispatch", value: "9", sub: "Awaiting shipment", icon: <Clock size={18} />, color: "bg-amber-50 text-amber-600" },
    { label: "Blockchain Records", value: "47", sub: "Immutable entries", icon: <ShieldCheck size={18} />, color: "bg-purple-50 text-purple-600" },
];

const BATCHES = [
    { id: "TMB-1001", type: "Teak Wood", origin: "Assam Forest Zone", qty: "200 kg", cert: "FSC Approved", date: "01 Jan 2026", status: "dispatched" },
    { id: "TMB-1002", type: "Mahogany", origin: "West Bengal Forest", qty: "150 kg", cert: "FSC Approved", date: "08 Mar 2026", status: "dispatched" },
    { id: "TMB-1003", type: "Rosewood", origin: "Assam Forest Zone", qty: "80 kg", cert: "Pending", date: "10 May 2026", status: "pending" },
    { id: "TMB-1004", type: "Walnut", origin: "Meghalaya Reserve", qty: "120 kg", cert: "FSC Approved", date: "12 May 2026", status: "pending" },
];

const ACTIVITY = [
    { text: "Batch TMB-1002 dispatched to Manufacturer MFG01", time: "3h ago", type: "success" },
    { text: "Timber batch TMB-1003 registered with FSC certification pending", time: "6h ago", type: "warning" },
    { text: "Blockchain record created for TMB-1001", time: "1d ago", type: "success" },
    { text: "Batch TMB-1004 harvested and logged", time: "2d ago", type: "info" },
    { text: "Certification renewed for batch TMB-1002", time: "3d ago", type: "success" },
];

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        dispatched: "bg-indigo-50 text-indigo-600",
        pending: "bg-amber-50 text-amber-600",
        registered: "bg-emerald-50 text-emerald-600",
    };
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
            {status}
        </span>
    );
}

function CertBadge({ cert }) {
    const approved = cert === "FSC Approved";
    return (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-500"}`}>
            {cert}
        </span>
    );
}

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ label, title, action }) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                    {label}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">{title}</h2>
            </div>
            {action && (
                <button className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                    {action} <ChevronRight size={13} />
                </button>
            )}
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SupplierDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
        { id: "register", label: "Register Timber", icon: <Trees size={15} /> },
        { id: "dispatch", label: "Dispatch Batches", icon: <Truck size={15} /> },
        { id: "records", label: "Timber Records", icon: <ClipboardList size={15} /> },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f7]">

            {/* ── Topbar ──────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <ShieldCheck size={17} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">Trackchain</span>
                        <span className="hidden sm:block text-gray-300 mx-1">|</span>
                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Supplier Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{user?.name ?? "Supplier"}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-colors"
                        >
                            <LogOut size={13} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-5 py-8">

                {/* ── Page heading ─────────────────────────────────────────── */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                        <Leaf size={12} /> Supplier Dashboard
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name ?? "Supplier"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Register timber batches, manage certifications, and dispatch to manufacturers.
                    </p>
                </div>

                {/* ── Stat cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {STATS.map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 hover:shadow-sm transition-all">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                                {s.icon}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{s.label}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div className="flex bg-white border border-gray-100 rounded-2xl p-1 mb-7 gap-1 overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 flex-1 justify-center py-2 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                                ${activeTab === t.id
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
                {activeTab === "overview" && (
                    <div className="grid lg:grid-cols-3 gap-6">

                        {/* Recent batches */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Timber" title="Recent Batches" action="View all" />
                            <div className="space-y-3">
                                {BATCHES.slice(0, 3).map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Trees size={16} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{b.type}</p>
                                                <p className="text-[11px] text-gray-400">{b.id} · {b.date}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={b.status} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity feed */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Live" title="Activity Feed" />
                            <div className="space-y-4">
                                {ACTIVITY.map((a, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0
                                            ${a.type === "success" ? "bg-emerald-50 text-emerald-500"
                                                : a.type === "warning" ? "bg-amber-50 text-amber-500"
                                                    : "bg-indigo-50 text-indigo-500"}`}>
                                            {a.type === "success" ? <CheckCircle2 size={13} />
                                                : a.type === "warning" ? <AlertCircle size={13} />
                                                    : <Activity size={13} />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-700 leading-relaxed">{a.text}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
                            {[
                                { icon: <Trees size={20} />, title: "Register Timber", desc: "Log a new timber batch with origin and certification details.", tab: "register", color: "bg-emerald-50 text-emerald-600" },
                                { icon: <Truck size={20} />, title: "Dispatch Batch", desc: "Send registered batches to manufacturers and record transfer.", tab: "dispatch", color: "bg-indigo-50 text-indigo-600" },
                                { icon: <ClipboardList size={20} />, title: "Timber Records", desc: "View the full blockchain audit trail of all timber batches.", tab: "records", color: "bg-purple-50 text-purple-600" },
                            ].map((card) => (
                                <div
                                    key={card.title}
                                    onClick={() => setActiveTab(card.tab)}
                                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                                        {card.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{card.title}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{card.desc}</p>
                                    <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium group-hover:gap-2 transition-all">
                                        Go to section <ArrowRight size={13} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══ REGISTER TIMBER ══════════════════════════════════════ */}
                {activeTab === "register" && (
                    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">

                        {/* Form */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Blockchain Entry" title="Register Timber Batch" />
                            <div className="space-y-4">
                                {[
                                    { label: "Batch ID", placeholder: "e.g. TMB-1005", icon: <Hash size={14} /> },
                                    { label: "Wood Type", placeholder: "e.g. Teak Wood", icon: <Trees size={14} /> },
                                    { label: "Forest / Origin Location", placeholder: "e.g. Assam Forest Zone", icon: <MapPin size={14} /> },
                                    { label: "Supplier ID", placeholder: "e.g. SUP01", icon: <User size={14} /> },
                                    { label: "Quantity (kg)", placeholder: "e.g. 200", icon: <PackageCheck size={14} /> },
                                    { label: "Harvest Date", placeholder: "", icon: <Calendar size={14} />, type: "date" },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                            {f.label}
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-300">{f.icon}</span>
                                            <input
                                                type={f.type ?? "text"}
                                                placeholder={f.placeholder}
                                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        FSC Certification
                                    </label>
                                    <div className="relative flex items-center">
                                        <FileCheck size={14} className="absolute left-3 text-gray-300" />
                                        <select className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-white">
                                            <option value="">Select status</option>
                                            <option>FSC Approved</option>
                                            <option>Pending</option>
                                            <option>Not Applicable</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <ShieldCheck size={15} />
                                    Register to Blockchain
                                </button>
                            </div>
                        </div>

                        {/* Existing batches */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Registered" title="Timber Batches on Blockchain" />
                            <div className="space-y-3">
                                {BATCHES.map((b) => (
                                    <div key={b.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{b.type}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{b.id} · {b.date}</p>
                                            </div>
                                            <StatusBadge status={b.status} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <MapPin size={11} className="text-gray-300" />
                                            <span className="text-[11px] text-gray-400">{b.origin}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2">
                                                <PackageCheck size={11} className="text-gray-300" />
                                                <span className="text-[11px] text-gray-400">{b.qty}</span>
                                            </div>
                                            <CertBadge cert={b.cert} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ DISPATCH BATCHES ════════════════════════════════════ */}
                {activeTab === "dispatch" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Outgoing" title="Dispatch Timber to Manufacturers" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Batch ID", "Wood Type", "Origin", "Quantity", "Certification", "Date", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {BATCHES.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">{b.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-700 font-medium">{b.type}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{b.origin}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{b.qty}</td>
                                            <td className="py-3 pr-4"><CertBadge cert={b.cert} /></td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{b.date}</td>
                                            <td className="py-3"><StatusBadge status={b.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-700">Dispatch selected batch</p>
                                <p className="text-xs text-indigo-400 mt-0.5">Dispatching creates an immutable ownership transfer on the blockchain.</p>
                            </div>
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                                Dispatch to Manufacturer <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ TIMBER RECORDS ════════════════════════════════════════ */}
                {activeTab === "records" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Blockchain Ledger" title="Timber Registration Records" />

                        <div className="space-y-4">
                            {[
                                { block: "Block 101", id: "TMB-1001", owner: "SUP01", stage: "Timber Registration", ts: "01-01-2026 09:00 AM", hash: "0x58ac2345bdf", prev: "0x00000000000..." },
                                { block: "Block 102", id: "TMB-1001", owner: "MFG01", stage: "Dispatched to Manufacturer", ts: "10-01-2026 11:20 AM", hash: "0xA45F89B21C", prev: "0x58ac2345bdf..." },
                                { block: "Block 105", id: "TMB-1002", owner: "SUP01", stage: "Timber Registration", ts: "08-03-2026 08:45 AM", hash: "0xD34F67RST9", prev: "0xC12E45NOP7..." },
                            ].map((b, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                <Trees size={14} className="text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{b.block}</span>
                                            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Confirmed</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> {b.ts}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { k: "Batch ID", v: b.id },
                                            { k: "Owner", v: b.owner },
                                            { k: "Stage", v: b.stage },
                                            { k: "Tx Hash", v: b.hash },
                                        ].map((row) => (
                                            <div key={row.k} className="bg-gray-50 rounded-lg p-2.5">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{row.k}</p>
                                                <p className="text-xs font-semibold text-gray-800 font-mono truncate">{row.v}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                                        <TrendingUp size={11} />
                                        Prev hash: <span className="font-mono">{b.prev}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust bar */}
                        <div className="flex justify-center gap-8 mt-7 pt-6 border-t border-gray-100">
                            {[
                                { icon: <ShieldCheck size={13} />, label: "Immutable storage" },
                                { icon: <FileCheck size={13} />, label: "FSC certified timber" },
                                { icon: <Activity size={13} />, label: "Real-time audit trail" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-1.5 text-gray-400">
                                    {s.icon}
                                    <span className="text-[12px]">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}