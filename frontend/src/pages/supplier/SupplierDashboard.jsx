import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import {
    ShieldCheck, Leaf, Truck, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, Trees, MapPin, ChevronRight, Activity,
    Hash, Calendar, User, PackageCheck, FileCheck
} from "lucide-react";
import { registerProduct, transferOwnership, getProductHistory } from "../../blockchain/contract";
import { getWalletAddress, onAccountChange } from "../../blockchain/provider";
import { WALLETS } from "../../blockchain/wallets";
import { generateBatchID } from "../../utils/generateIds";
import { toast } from "react-toastify";

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
    const [walletAddress, setWalletAddress] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [txError, setTxError] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [blockchainProducts, setBlockchainProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [allHistory, setAllHistory] = useState([]);

    // Replace the STATS with this:
    const STATS = [
        { label: "Timber Batches Registered", value: blockchainProducts.length.toString(), sub: "On blockchain", icon: <Trees size={18} />, color: "bg-emerald-50 text-emerald-600" },
        { label: "Batches Dispatched", value: blockchainProducts.filter(p => p.stage > 0).length.toString(), sub: "Transferred", icon: <Truck size={18} />, color: "bg-indigo-50 text-indigo-600" },
        { label: "Pending Dispatch", value: blockchainProducts.filter(p => p.stage === 0).length.toString(), sub: "Awaiting shipment", icon: <Clock size={18} />, color: "bg-amber-50 text-amber-600" },
        { label: "Blockchain Records", value: allHistory.length.toString(), sub: "Immutable entries", icon: <ShieldCheck size={18} />, color: "bg-purple-50 text-purple-600" },
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            if (blockchainProducts.length === 0) return;
            const histories = await Promise.all(
                blockchainProducts.map(p => getProductHistory(p.id))
            );
            setAllHistory(histories.flat());
        };
        fetchHistory();
    }, [blockchainProducts]);

    // After getting wallet address, verify it's the supplier
    useEffect(() => {
        const checkRole = async () => {
            const address = await getWalletAddress();
            setWalletAddress(address);

            if (address.toLowerCase() !== WALLETS.supplier.toLowerCase()) {
                alert("⚠️ Please switch MetaMask to the Supplier account!");
            }
        };
        checkRole();
    }, []);

    // Fetch all registered products from blockchain
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const { ethers } = await import("ethers");
                const { ABI, CONTRACT_ADDRESS } = await import("../../blockchain/config");

                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

                // Get total product count
                const total = await contract.allProductIDs.length; // won't work directly

                // Better: listen to events OR fetch by known IDs
                const ids = await Promise.all(
                    [...Array(20).keys()].map(i =>
                        contract.allProductIDs(i).catch(() => null)
                    )
                );

                const products = await Promise.all(
                    ids.filter(Boolean).map(id => contract.getProduct(id))
                );

                setBlockchainProducts(products.map(p => ({
                    id: p.productID,
                    timberBatchID: p.timberBatchID,
                    stage: Number(p.stage),
                    currentOwner: p.currentOwner,
                    timestamp: new Date(Number(p.timestamp) * 1000).toLocaleDateString(),
                    status: Number(p.stage) === 0 ? "registered" : "dispatched"
                })));
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (window.ethereum) fetchProducts();
    }, [txHash]); // refetch after every transaction

    const [formData, setFormData] = useState({
        batchID: generateBatchID(), // ← auto-generated
        woodType: "",
        origin: "",
        supplierID: user?.userId || "SUP01",
        quantity: "",
        harvestDate: "",
        certification: "",
    });

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

    useEffect(() => {
        getWalletAddress().then(setWalletAddress).catch(console.error);
        onAccountChange((newAddress) => setWalletAddress(newAddress));
    }, []);

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegisterTimber = async () => {
        setTxLoading(true);
        setTxError("");
        setTxHash("");
        try {
            const notes = `${formData.woodType} | ${formData.origin} | ${formData.certification} | Qty: ${formData.quantity}kg`;
            const hash = await registerProduct(formData.batchID, formData.batchID, notes);
            setTxHash(hash);
        } catch (err) {
            setTxError(err.message || "Transaction failed");
        } finally {
            setTxLoading(false);
        }
    };

    const handleDispatch = async (batchID, manufacturerWallet) => {
        setTxLoading(true);
        setTxError("");
        setTxHash("");
        try {
            const hash = await transferOwnership(batchID, manufacturerWallet, "Dispatched to Manufacturer");
            setTxHash(hash);
        } catch (err) {
            setTxError(err.message || "Dispatch failed");
        } finally {
            setTxLoading(false);
        }
    };

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
                            <span className="text-xs font-medium text-gray-700">
                                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected"}
                            </span>
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
                                {blockchainProducts.slice(0, 3).map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Trees size={16} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{b.id}</p>
                                                <p className="text-[11px] text-gray-400">{b.id} · {b.timestamp}</p>
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
                                {allHistory.slice(0, 5).map((entry, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500">
                                            <CheckCircle2 size={13} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                {entry.stage} — {entry.notes}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{entry.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                                {allHistory.length === 0 && (
                                    <p className="text-xs text-gray-400">No activity yet.</p>
                                )}
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
                                    { label: "Batch ID", field: "batchID", placeholder: "e.g. TMB-1005", icon: <Hash size={14} /> },
                                    { label: "Wood Type", field: "woodType", placeholder: "e.g. Teak Wood", icon: <Trees size={14} /> },
                                    { label: "Forest / Origin Location", field: "origin", placeholder: "e.g. Assam Forest Zone", icon: <MapPin size={14} /> },
                                    { label: "Supplier ID", field: "supplierID", placeholder: "e.g. SUP01", icon: <User size={14} /> },
                                    { label: "Quantity (kg)", field: "quantity", placeholder: "e.g. 200", icon: <PackageCheck size={14} /> },
                                    { label: "Harvest Date", field: "harvestDate", placeholder: "", icon: <Calendar size={14} />, type: "date" },
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
                                                value={formData[f.field]}
                                                onChange={(e) => setFormData(prev => ({ ...prev, [f.field]: e.target.value }))}
                                                readOnly={f.field === "batchID" || f.field === "supplierID"}
                                                className={`w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10
        ${f.field === "batchID" || f.field === "supplierID" ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                                            />
                                            {f.label === "Batch ID" &&
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, batchID: generateBatchID() }))}
                                                    className="absolute right-3 text-[11px] text-indigo-400 hover:text-indigo-600"
                                                >
                                                    ↻ Generate
                                                </button>
                                            }
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        FSC Certification
                                    </label>
                                    <div className="relative flex items-center">
                                        <FileCheck size={14} className="absolute left-3 text-gray-300" />
                                        <select
                                            value={formData.certification}
                                            onChange={(e) => setFormData(prev => ({ ...prev, certification: e.target.value }))}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-white"
                                        >
                                            <option value="">Select status</option>
                                            <option>FSC Approved</option>
                                            <option>Pending</option>
                                            <option>Not Applicable</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRegisterTimber}
                                    disabled={txLoading}
                                    className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ShieldCheck size={15} />
                                    {txLoading ? "Registering..." : "Register to Blockchain"}
                                </button>

                                {/* Show success or error below button */}
                                {txHash && (
                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <p className="text-xs text-emerald-600 font-medium">✅ Registered successfully!</p>
                                        <p className="text-[11px] font-mono text-emerald-500 mt-1 truncate">Tx: {txHash}</p>
                                    </div>
                                )}
                                {txError && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-xs text-red-500">❌ {txError}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Existing batches */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Registered" title="Timber Batches on Blockchain" />
                            <div className="space-y-3">
                                {loadingProducts ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                        <Clock size={32} className="mb-2 animate-spin" />
                                        <p className="text-xs text-gray-400">Loading from blockchain...</p>
                                    </div>
                                ) : blockchainProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                        <Trees size={32} className="mb-2" />
                                        <p className="text-sm font-medium text-gray-400">No batches registered yet</p>
                                        <p className="text-xs text-gray-300 mt-1">Register your first timber batch to get started</p>
                                    </div>
                                ) : blockchainProducts.map((b) => (
                                    <div key={b.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{b.id}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{b.timberBatchID} · {b.timestamp}</p>
                                            </div>
                                            <StatusBadge status={b.status} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <User size={11} className="text-gray-300" />
                                            <span className="text-[11px] text-gray-400 font-mono">
                                                {b.currentOwner.slice(0, 6)}...{b.currentOwner.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "dispatch" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Outgoing" title="Dispatch Timber to Manufacturers" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product ID", "Timber Batch", "Current Owner", "Registered On", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {blockchainProducts.map((b) => (
                                        <tr
                                            key={b.id}
                                            onClick={() => setSelectedBatch(b.id)}
                                            className={`cursor-pointer transition-colors ${selectedBatch === b.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                                        >
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">{b.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-700 font-medium">{b.timberBatchID}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-500 font-mono">
                                                {b.currentOwner.slice(0, 6)}...{b.currentOwner.slice(-4)}
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-500">{b.timestamp}</td>
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
                            <button
                                onClick={() => handleDispatch(selectedBatch, WALLETS.manufacturer)}
                                disabled={txLoading || !selectedBatch}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                            >
                                {txLoading ? "Dispatching..." : `Dispatch ${selectedBatch || "..."} to Manufacturer`}
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ TIMBER RECORDS ════════════════════════════════════════ */}
                {activeTab === "records" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Blockchain Ledger" title="Timber Registration Records" />

                        <div className="space-y-4">
                            {loadingProducts ? (
                                <p className="text-xs text-gray-400 text-center py-8">Loading from blockchain...</p>
                            ) : allHistory.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-8">No blockchain records yet.</p>
                            ) : allHistory.map((entry, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors">

                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                <Trees size={14} className="text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">Record #{i + 1}</span>
                                            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                                Confirmed
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> {entry.timestamp}
                                        </span>
                                    </div>

                                    {/* Data grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { k: "Actor", v: `${entry.actor.slice(0, 6)}...${entry.actor.slice(-4)}` },
                                            { k: "Stage", v: entry.stage },
                                            { k: "Notes", v: entry.notes },
                                            { k: "Timestamp", v: entry.timestamp },
                                        ].map((row) => (
                                            <div key={row.k} className="bg-gray-50 rounded-lg p-2.5">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{row.k}</p>
                                                <p className="text-xs font-semibold text-gray-800 font-mono truncate">{row.v}</p>
                                            </div>
                                        ))}
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