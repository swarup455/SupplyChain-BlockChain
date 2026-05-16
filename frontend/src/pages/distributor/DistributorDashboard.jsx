import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import {
    ShieldCheck, Truck, Package, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, ChevronRight, Activity, Hash, Calendar,
    User, MapPin, Navigation, Store
} from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const STATS = [
    { label: "Products Received", value: "61", sub: "+4 this week", icon: <Package size={18} />, color: "bg-sky-50 text-sky-600" },
    { label: "Shipments Dispatched", value: "52", sub: "+3 today", icon: <Truck size={18} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "In Transit", value: "9", sub: "En route to retailers", icon: <Navigation size={18} />, color: "bg-amber-50 text-amber-600" },
    { label: "Blockchain Records", value: "113", sub: "Immutable entries", icon: <ShieldCheck size={18} />, color: "bg-purple-50 text-purple-600" },
];

const RECEIVED = [
    { id: "DT2026-001", name: "Oak Dining Table", from: "MFG01", shipment: "SHP001", date: "20 Jan 2026", status: "received" },
    { id: "DT2026-002", name: "Teak Wardrobe", from: "MFG01", shipment: "SHP002", date: "13 May 2026", status: "received" },
    { id: "DT2026-003", name: "Walnut Bookshelf", from: "MFG01", shipment: "SHP003", date: "14 May 2026", status: "in-transit" },
    { id: "DT2026-004", name: "Mahogany Bed Frame", from: "MFG02", shipment: "SHP004", date: "15 May 2026", status: "pending" },
];

const ACTIVITY = [
    { text: "Shipment SHP002 delivered to Retailer RET01", time: "2h ago", type: "success" },
    { text: "Product DT2026-003 dispatched via Truck — in transit", time: "5h ago", type: "info" },
    { text: "Ownership of DT2026-001 transferred from MFG01 to DIST01", time: "8h ago", type: "success" },
    { text: "Product DT2026-004 pending receipt confirmation", time: "1d ago", type: "warning" },
    { text: "Blockchain record created for SHP001 dispatch", time: "2d ago", type: "success" },
];

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        received: "bg-emerald-50 text-emerald-600",
        "in-transit": "bg-sky-50 text-sky-600",
        dispatched: "bg-indigo-50 text-indigo-600",
        pending: "bg-amber-50 text-amber-600",
    };
    const labels = { "in-transit": "In Transit" };
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
            {labels[status] ?? status}
        </span>
    );
}

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
export default function DistributorDashboard() {
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
        { id: "received", label: "Received Products", icon: <Package size={15} /> },
        { id: "dispatch", label: "Dispatch to Retailer", icon: <Truck size={15} /> },
        { id: "records", label: "Shipment Records", icon: <ClipboardList size={15} /> },
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
                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Distributor Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-sky-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{user?.name ?? "Distributor"}</span>
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
                    <div className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-semibold bg-sky-50 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                        <Truck size={12} /> Distributor Dashboard
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name ?? "Distributor"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Receive products from manufacturers, manage shipments, and dispatch to retailers.
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

                        {/* Recent products */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Incoming" title="Recently Received Products" action="View all" />
                            <div className="space-y-3">
                                {RECEIVED.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-sky-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-[11px] text-gray-400">{p.id} · From {p.from} · {p.date}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status} />
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
                                { icon: <Package size={20} />, title: "Received Products", desc: "View products received from manufacturers and confirm ownership.", tab: "received", color: "bg-sky-50 text-sky-600" },
                                { icon: <Truck size={20} />, title: "Dispatch to Retailer", desc: "Create a shipment and transfer ownership to the retailer.", tab: "dispatch", color: "bg-indigo-50 text-indigo-600" },
                                { icon: <ClipboardList size={20} />, title: "Shipment Records", desc: "View full blockchain audit trail of all distribution events.", tab: "records", color: "bg-purple-50 text-purple-600" },
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

                {/* ══ RECEIVED PRODUCTS ═════════════════════════════════════ */}
                {activeTab === "received" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="From Manufacturer" title="Products Received" />
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Shipment ID", "Product ID", "Product Name", "From", "Date", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {RECEIVED.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md">{p.shipment}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium font-mono">{p.id}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-700 font-medium">{p.name}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{p.from}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{p.date}</td>
                                            <td className="py-3"><StatusBadge status={p.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-700">Confirm product receipt</p>
                                <p className="text-xs text-indigo-400 mt-0.5">Confirming receipt records ownership transfer to DIST01 on the blockchain.</p>
                            </div>
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                                Confirm Receipt <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ DISPATCH TO RETAILER ══════════════════════════════════ */}
                {activeTab === "dispatch" && (
                    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">

                        {/* Form */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Blockchain Entry" title="Create Shipment" />
                            <div className="space-y-4">
                                {[
                                    { label: "Shipment ID", placeholder: "e.g. SHP005", icon: <Hash size={14} /> },
                                    { label: "Product ID", placeholder: "e.g. DT2026-003", icon: <Package size={14} /> },
                                    { label: "Distributor ID", placeholder: "e.g. DIST01", icon: <Truck size={14} /> },
                                    { label: "Retailer ID", placeholder: "e.g. RET01", icon: <Store size={14} /> },
                                    { label: "Destination", placeholder: "e.g. Kolkata Retail Hub", icon: <MapPin size={14} /> },
                                    { label: "Dispatch Date", placeholder: "", icon: <Calendar size={14} />, type: "date" },
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
                                        Transport Mode
                                    </label>
                                    <div className="relative flex items-center">
                                        <Navigation size={14} className="absolute left-3 text-gray-300" />
                                        <select className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-white">
                                            <option value="">Select mode</option>
                                            <option>Truck</option>
                                            <option>Rail</option>
                                            <option>Air</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <ShieldCheck size={15} />
                                    Record Dispatch on Blockchain
                                </button>
                            </div>
                        </div>

                        {/* Active shipments */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Active" title="Current Shipments" />
                            <div className="space-y-3">
                                {RECEIVED.map((p) => (
                                    <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{p.id} · {p.date}</p>
                                            </div>
                                            <StatusBadge status={p.status} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Hash size={11} className="text-gray-300" />
                                            <span className="font-mono text-[11px] text-gray-400">{p.shipment}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Truck size={11} className="text-gray-300" />
                                            <span className="text-[11px] text-gray-400">From: {p.from}</span>
                                        </div>
                                        <button className="mt-3 w-full text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-300 py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1">
                                            Transfer to Retailer <ArrowRight size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ SHIPMENT RECORDS ══════════════════════════════════════ */}
                {activeTab === "records" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Blockchain Ledger" title="Distribution Records" />
                        <div className="space-y-4">
                            {[
                                { block: "Block 103", id: "DT2026-001", owner: "DIST01", stage: "Dispatched for Distribution", ts: "20-01-2026 02:15 PM", hash: "0xB98D72KLM4", prev: "0xA45F89B21C..." },
                                { block: "Block 104", id: "DT2026-001", owner: "RET01", stage: "Delivered to Retail Store", ts: "12-01-2026 10:00 AM", hash: "0x9d4e5623ac89", prev: "0xB98D72KLM4..." },
                                { block: "Block 106", id: "DT2026-002", owner: "DIST01", stage: "Dispatched for Distribution", ts: "13-05-2026 03:30 PM", hash: "0xE56K90UVW2", prev: "0xD34F67RST9..." },
                            ].map((b, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                                                <Truck size={14} className="text-white" />
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
                                            { k: "Product ID", v: b.id },
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
                        <div className="flex justify-center gap-8 mt-7 pt-6 border-t border-gray-100">
                            {[
                                { icon: <ShieldCheck size={13} />, label: "Immutable storage" },
                                { icon: <Truck size={13} />, label: "Transport verified" },
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