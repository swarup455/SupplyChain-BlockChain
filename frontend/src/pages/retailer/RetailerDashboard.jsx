import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import ProductQRGenerator from "./ProductQrCode";
import {
    ShieldCheck, Package, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, Boxes, Store, ChevronRight, Activity,
    Hash, User, Search, QrCode, Truck
} from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const STATS = [
    { label: "Products in Inventory", value: "86", sub: "+8 this week", icon: <Boxes size={18} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Pending Receipts", value: "5", sub: "Awaiting confirmation", icon: <Clock size={18} />, color: "bg-amber-50 text-amber-600" },
    { label: "Products Sold", value: "42", sub: "+3 today", icon: <Store size={18} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Blockchain Records", value: "134", sub: "Immutable entries", icon: <ShieldCheck size={18} />, color: "bg-purple-50 text-purple-600" },
];

const INCOMING = [
    { id: "DT2026-001", name: "Oak Dining Table", distributor: "DIST01", shipment: "SHP001", qty: 10, date: "10 May 2026", status: "received" },
    { id: "DT2026-002", name: "Teak Wardrobe", distributor: "DIST01", shipment: "SHP002", qty: 6, date: "12 May 2026", status: "received" },
    { id: "DT2026-004", name: "Rosewood Cabinet", distributor: "DIST02", shipment: "SHP003", qty: 4, date: "14 May 2026", status: "pending" },
    { id: "DT2026-005", name: "Walnut Side Table", distributor: "DIST02", shipment: "SHP004", qty: 12, date: "15 May 2026", status: "pending" },
];

const INVENTORY = [
    { id: "DT2026-001", name: "Oak Dining Table", material: "TMB-1001", qty: 10, arrivalDate: "10 May 2026", hash: "0xA45F89B21C", status: "in-stock" },
    { id: "DT2026-002", name: "Teak Wardrobe", material: "TMB-1002", qty: 4, arrivalDate: "12 May 2026", hash: "0xB98D72KLM4", status: "low-stock" },
    { id: "DT2026-003", name: "Walnut Bookshelf", material: "TMB-1001", qty: 0, arrivalDate: "08 May 2026", hash: "0xC12E45NOP7", status: "sold-out" },
];

const ACTIVITY = [
    { text: "Product DT2026-002 receipt confirmed from Distributor DIST01", time: "2h ago", type: "success" },
    { text: "Customer verified product DT2026-001 via QR code", time: "4h ago", type: "info" },
    { text: "Blockchain record created for DT2026-001 retail entry", time: "7h ago", type: "success" },
    { text: "Shipment SHP003 arriving from Distributor DIST02", time: "1d ago", type: "warning" },
    { text: "Inventory updated for DT2026-003 — sold out", time: "1d ago", type: "info" },
];

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        received: "bg-emerald-50 text-emerald-600",
        pending: "bg-amber-50 text-amber-600",
        "in-stock": "bg-emerald-50 text-emerald-600",
        "low-stock": "bg-amber-50 text-amber-600",
        "sold-out": "bg-red-50 text-red-500",
    };
    const labels = {
        "in-stock": "In Stock",
        "low-stock": "Low Stock",
        "sold-out": "Sold Out",
    };
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
            {labels[status] ?? status}
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
export default function RetailerDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");
    const [verifyInput, setVerifyInput] = useState("");
    const [verifyResult, setVerifyResult] = useState(null);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    const handleVerify = () => {
        if (verifyInput.trim() === "DT2026-001") {
            setVerifyResult({
                id: "DT2026-001",
                name: "Oak Dining Table",
                history: [
                    { stage: "Timber Registration", owner: "SUP01", date: "01-01-2026", hash: "0x58ac2345bdf" },
                    { stage: "Production Completed", owner: "MFG01", date: "05-01-2026", hash: "0xA45F89B21C" },
                    { stage: "Dispatched for Distribution", owner: "DIST01", date: "10-01-2026", hash: "0xB98D72KLM4" },
                    { stage: "Retail Store Inventory", owner: "RET01", date: "10-05-2026", hash: "0xD78F12QRS9" },
                ],
            });
        } else {
            setVerifyResult(null);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
        { id: "incoming", label: "Incoming Shipments", icon: <Truck size={15} /> },
        { id: "inventory", label: "Inventory", icon: <Boxes size={15} /> },
        { id: "verify", label: "Customer Verify", icon: <QrCode size={15} /> },
        { id: "qrcodes", label: "QR Codes", icon: <QrCode size={15} /> },  // ← add this
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
                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Retailer Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-indigo-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{user?.name ?? "Retailer"}</span>
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
                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                        <Store size={12} /> Retailer Dashboard
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name ?? "Retailer"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage inventory, confirm shipments, and enable customer product verification.
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

                        {/* Inventory snapshot */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Inventory" title="Current Stock" action="View all" />
                            <div className="space-y-3">
                                {INVENTORY.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-[11px] text-gray-400">{p.id} · Qty: {p.qty} · {p.arrivalDate}</p>
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
                                { icon: <Truck size={20} />, title: "Incoming Shipments", desc: "View products dispatched from distributors and confirm receipt.", tab: "incoming", color: "bg-indigo-50 text-indigo-600" },
                                { icon: <Boxes size={20} />, title: "Inventory", desc: "Monitor current stock levels and product details.", tab: "inventory", color: "bg-emerald-50 text-emerald-600" },
                                { icon: <QrCode size={20} />, title: "Customer Verify", desc: "Allow customers to verify product authenticity via Product ID.", tab: "verify", color: "bg-purple-50 text-purple-600" },
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

                {/* ══ INCOMING SHIPMENTS ════════════════════════════════════ */}
                {activeTab === "incoming" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="From Distributors" title="Incoming Shipments" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product ID", "Product Name", "Distributor", "Shipment ID", "Quantity", "Date", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {INCOMING.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium">{s.id}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-700 font-medium">{s.name}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{s.distributor}</td>
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{s.shipment}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{s.qty} units</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{s.date}</td>
                                            <td className="py-3"><StatusBadge status={s.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-700">Confirm shipment receipt</p>
                                <p className="text-xs text-indigo-400 mt-0.5">Confirming receipt creates an immutable blockchain record and updates your inventory.</p>
                            </div>
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                                Confirm Receipt <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ INVENTORY ═════════════════════════════════════════════ */}
                {activeTab === "inventory" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Retail Store" title="Product Inventory" />

                        <div className="space-y-3">
                            {INVENTORY.map((p) => (
                                <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{p.id} · Arrived: {p.arrivalDate}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Quantity</p>
                                            <p className="text-xs font-semibold text-gray-800">{p.qty} units</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Material Batch</p>
                                            <p className="text-xs font-semibold text-gray-800 font-mono">{p.material}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tx Hash</p>
                                            <p className="text-xs font-semibold text-gray-800 font-mono truncate">{p.hash}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust bar */}
                        <div className="flex justify-center gap-8 mt-7 pt-6 border-t border-gray-100">
                            {[
                                { icon: <ShieldCheck size={13} />, label: "Immutable storage" },
                                { icon: <ClipboardList size={13} />, label: "Full audit trail" },
                                { icon: <Activity size={13} />, label: "Real-time tracking" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-1.5 text-gray-400">
                                    {s.icon}
                                    <span className="text-[12px]">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══ CUSTOMER VERIFY ═══════════════════════════════════════ */}
                {activeTab === "verify" && (
                    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">

                        {/* Verify form */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Authentication" title="Verify Product" />
                            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                                Enter a Product ID to retrieve the complete blockchain history for customer authentication.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        Product ID
                                    </label>
                                    <div className="relative flex items-center">
                                        <Search size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="e.g. DT2026-001"
                                            value={verifyInput}
                                            onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleVerify}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ShieldCheck size={15} />
                                    Retrieve Blockchain History
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <QrCode size={14} className="text-indigo-500" />
                                    <p className="text-xs font-semibold text-gray-700">QR Code Scanning</p>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Customers can also scan the QR code on the product label to instantly retrieve verification history on their device.
                                </p>
                            </div>
                        </div>

                        {/* Verification result */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Blockchain Ledger" title="Product History" />

                            {!verifyResult && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                                        <Search size={20} className="text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Enter a Product ID to view its history</p>
                                    <p className="text-xs text-gray-400 mt-1">Try: DT2026-001</p>
                                </div>
                            )}

                            {verifyResult && (
                                <div>
                                    <div className="flex items-center gap-2 mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-700">{verifyResult.name}</p>
                                            <p className="text-[11px] text-emerald-500">{verifyResult.id} · Verified on blockchain</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {verifyResult.history.map((h, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                                        <ShieldCheck size={13} className="text-white" />
                                                    </div>
                                                    {i < verifyResult.history.length - 1 && (
                                                        <div className="w-px flex-1 bg-indigo-100 mt-1" />
                                                    )}
                                                </div>
                                                <div className="pb-3">
                                                    <p className="text-xs font-semibold text-gray-900">{h.stage}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">Owner: {h.owner} · {h.date}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Hash size={10} className="text-gray-300" />
                                                        <span className="font-mono text-[10px] text-gray-400">{h.hash}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                                        <TrendingUp size={13} className="text-indigo-500 shrink-0" />
                                        <p className="text-[11px] text-indigo-600">Complete supply chain history retrieved from the immutable blockchain ledger.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ QR CODES ══════════════════════════════════════════════════ */}
                {activeTab === "qrcodes" && (
                    <ProductQRGenerator />
                )}
            </div>
        </div>
    );
}