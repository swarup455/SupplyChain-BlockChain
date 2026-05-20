import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import { createFinishedProduct, transferOwnership, getProductHistory } from "../../blockchain/contract";
import { getWalletAddress, onAccountChange } from "../../blockchain/provider";
import { WALLETS } from "../../blockchain/wallets";
import { useState, useEffect } from "react";
import { generateProductID } from "../../utils/generateIds";
import {
    ShieldCheck, Package, Cpu, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, Boxes, Factory, ChevronRight, Activity,
    Hash, Calendar, User
} from "lucide-react";

function StatusBadge({ status }) {
    const map = {
        available: "bg-emerald-50 text-emerald-600",
        used: "bg-red-50 text-red-400",
        ready: "bg-indigo-50 text-indigo-600",
        dispatched: "bg-purple-50 text-purple-600",
    };
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
            {status}
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
export default function ManufacturerDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");
    const [walletAddress, setWalletAddress] = useState("");
    const [myTimber, setMyTimber] = useState([]);
    const [finishedProducts, setFinishedProducts] = useState([]);
    const [allHistory, setAllHistory] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [newProductID, setNewProductID] = useState("");
    const [selectedTimber, setSelectedTimber] = useState("");
    const [productNotes, setProductNotes] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [createHash, setCreateHash] = useState("");
    const [createError, setCreateError] = useState("");
    const [dispatchedCount, setDispatchedCount] = useState(0);

    // Dispatch to distributor states
    const [selectedFinishedProduct, setSelectedFinishedProduct] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [txError, setTxError] = useState("");

    // Manufacturer ID from Redux user
    const manufacturerID = user?.userId ?? "MFG-0001";

    // ── Stats derived from real data ─────────────────────────────────────────
    const STATS = [
        {
            label: "Raw Materials",
            value: myTimber.length.toString(),
            sub: "Timber assigned to you",
            icon: <Boxes size={18} />,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            label: "Finished Products",
            value: finishedProducts.length.toString(),
            sub: "Created by you",
            icon: <Factory size={18} />,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            label: "Dispatched",
            value: dispatchedCount.toString(),
            sub: "Sent to distributor",
            icon: <Clock size={18} />,
            color: "bg-amber-50 text-amber-600"
        },
        {
            label: "Blockchain Records",
            value: allHistory.length.toString(),
            sub: "Immutable entries",
            icon: <ShieldCheck size={18} />,
            color: "bg-purple-50 text-purple-600"
        },
    ];

    // ── Tabs ─────────────────────────────────────────────────────────────────
    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
        { id: "materials", label: "Raw Materials", icon: <Boxes size={15} /> },
        { id: "products", label: "Create Product", icon: <Factory size={15} /> },
        { id: "dispatch", label: "Dispatch", icon: <ArrowRight size={15} /> },
        { id: "records", label: "Records", icon: <ClipboardList size={15} /> },
    ];

    // ── Logout ───────────────────────────────────────────────────────────────
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    // ── Check wallet role on mount ───────────────────────────────────────────
    useEffect(() => {
        const checkRole = async () => {
            try {
                const address = await getWalletAddress();
                setWalletAddress(address);
                if (address.toLowerCase() !== WALLETS.manufacturer.toLowerCase()) {
                    alert("⚠️ Please switch MetaMask to the Manufacturer account!");
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkRole();
        onAccountChange((newAddress) => setWalletAddress(newAddress));
    }, []);

    // ── Fetch all products from blockchain, split into timber vs finished ────
    useEffect(() => {
        const fetchMyProducts = async () => {
            setLoadingProducts(true);
            try {
                const { ethers } = await import("ethers");
                const { ABI, CONTRACT_ADDRESS } = await import("../../blockchain/config");

                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

                const ids = await Promise.all(
                    [...Array(20).keys()].map(i =>
                        contract.allProductIDs(i).catch(() => null)
                    )
                );

                const allProducts = await Promise.all(
                    ids.filter(Boolean).map(id => contract.getProduct(id))
                );

                // Only products currently owned by manufacturer
                const mine = allProducts.filter(p =>
                    p.currentOwner.toLowerCase() === WALLETS.manufacturer.toLowerCase()
                );

                // Split: timber IDs start with "TMB-", finished products start with "FP-"
                const timber = mine
                    .filter(p => p.productID.startsWith("TMB-"))
                    .map(p => ({
                        id: p.productID,
                        timberBatchID: p.timberBatchID,
                        stage: Number(p.stage),
                        currentOwner: p.currentOwner,
                        timestamp: new Date(Number(p.timestamp) * 1000).toLocaleDateString(),
                        timberUsed: p.timberUsed,
                        status: p.timberUsed ? "used" : "available",
                    }));

                const finished = mine
                    .filter(p => p.productID.startsWith("FP-"))
                    .map(p => ({
                        id: p.productID,
                        timberBatchID: p.timberBatchID,
                        stage: Number(p.stage),
                        currentOwner: p.currentOwner,
                        timestamp: new Date(Number(p.timestamp) * 1000).toLocaleDateString(),
                        status: "ready",
                    }));

                setMyTimber(timber);
                setFinishedProducts(finished);

                const allFP = allProducts.filter(p => p.productID.startsWith("FP-"));
                const dispatched = allFP.filter(p => Number(p.stage) > 1);
                setDispatchedCount(dispatched.length);

            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (window.ethereum) fetchMyProducts();
    }, [txHash, createHash]);  // refetch after any transaction

    // ── Fetch history for all finished products ──────────────────────────────
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { ethers } = await import("ethers");
                const { ABI, CONTRACT_ADDRESS } = await import("../../blockchain/config");

                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

                // Fetch ALL product IDs — not just ones currently owned by manufacturer
                const ids = await Promise.all(
                    [...Array(20).keys()].map(i =>
                        contract.allProductIDs(i).catch(() => null)
                    )
                );

                const validIDs = ids.filter(Boolean);

                // Only fetch history for FP- products (finished products made by manufacturer)
                const fpIDs = validIDs.filter(id => id.startsWith("FP-"));

                if (fpIDs.length === 0) return;

                const histories = await Promise.all(
                    fpIDs.map(id => getProductHistory(id))
                );

                setAllHistory(histories.flat());
            } catch (err) {
                console.error(err);
            }
        };

        if (window.ethereum) fetchHistory();
    }, [txHash, createHash]); // refetch after any transaction

    // ── Auto-generate Product ID when switching to Create Product tab ────────
    useEffect(() => {
        if (activeTab === "products") {
            setNewProductID(generateProductID());
        }
    }, [activeTab]);

    // ── Create finished product on blockchain ────────────────────────────────
    const handleCreateProduct = async () => {
        if (!selectedTimber || !newProductID) return;
        setCreateLoading(true);
        setCreateError("");
        setCreateHash("");
        try {
            const { createFinishedProduct } = await import("../../blockchain/contract");
            const notes = productNotes.trim() || "Finished product registered by manufacturer";
            const hash = await createFinishedProduct(newProductID, selectedTimber, notes);
            setCreateHash(hash);
            setNewProductID(generateProductID()); // ready for next product
            setSelectedTimber("");
            setProductNotes("");
        } catch (err) {
            setCreateError(err.message || "Product creation failed");
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Dispatch finished product to distributor ─────────────────────────────
    const handleDispatchToDistributor = async () => {
        if (!selectedFinishedProduct) return;
        setTxLoading(true);
        setTxError("");
        setTxHash("");
        try {
            const hash = await transferOwnership(
                selectedFinishedProduct,
                WALLETS.distributor,
                "Dispatched to Distributor"
            );
            setTxHash(hash);
            setSelectedFinishedProduct("");
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
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <ShieldCheck size={17} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">Trackchain</span>
                        <span className="hidden sm:block text-gray-300 mx-1">|</span>
                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Manufacturer Portal</span>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-indigo-600" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{user?.name ?? "Manufacturer"}</span>
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
                        <Factory size={12} /> Manufacturer Dashboard
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.name ?? "Manufacturer"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage production, materials, and blockchain records from here.
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
                            <SectionHeader label="Production" title="Recent Products" action="View all" />
                            <div className="space-y-3">
                                {finishedProducts.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">No finished products yet.</p>
                                ) : finishedProducts.slice(0, 3).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.id}</p>
                                                <p className="text-[11px] text-gray-400">{p.timberBatchID} · {p.timestamp}</p>
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
                                {allHistory.slice(0, 5).map((entry, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500">
                                            <CheckCircle2 size={13} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-700">{entry.stage} — {entry.notes}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{entry.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
                            {[
                                { icon: <Boxes size={20} />, title: "Receive Materials", desc: "View incoming timber from suppliers and confirm receipt.", tab: "materials", color: "bg-indigo-50 text-indigo-600" },
                                { icon: <Factory size={20} />, title: "Create Product", desc: "Register a new furniture product to the blockchain.", tab: "products", color: "bg-emerald-50 text-emerald-600" },
                                { icon: <ClipboardList size={20} />, title: "Production Records", desc: "View full blockchain audit trail of manufacturing.", tab: "records", color: "bg-purple-50 text-purple-600" },
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

                {/* ══ RECEIVE MATERIALS ═════════════════════════════════════ */}
                {activeTab === "materials" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Incoming" title="Raw Materials from Suppliers" />
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product ID", "Timber Batch", "Received On", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingProducts ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-xs text-gray-400">Loading from blockchain...</td></tr>
                                    ) : myTimber.length === 0 ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-xs text-gray-400">No timber assigned yet.</td></tr>
                                    ) : myTimber.map((m) => (
                                        <tr key={m.id} className="transition-colors opacity-60 cursor-not-allowed">
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{m.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium">{m.timberBatchID}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{m.timestamp}</td>
                                            <td className="py-3"><StatusBadge status={m.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-xs text-gray-400">
                                Timber marked as <span className="text-red-400 font-semibold">used</span> has been consumed to create a finished product.
                                Go to <span className="text-indigo-500 font-semibold cursor-pointer" onClick={() => setActiveTab("products")}>Create Product</span> to use available timber.
                            </p>
                        </div>
                    </div>
                )}

                {/* ══ CREATE PRODUCTS ═══════════════════════════════════════ */}
                {activeTab === "products" && (
                    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">

                        {/* Form */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Blockchain Entry" title="Register New Product" />
                            <div className="space-y-4">

                                {/* Product ID — readonly, auto-generated */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">Product ID</label>
                                    <div className="relative flex items-center">
                                        <Hash size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            readOnly
                                            value={newProductID}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Manufacturer ID — readonly, from Redux */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">Manufacturer ID</label>
                                    <div className="relative flex items-center">
                                        <Factory size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            readOnly
                                            value={manufacturerID}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Select Timber — dropdown of available timber */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">Select Timber (Source)</label>
                                    <div className="relative flex items-center">
                                        <Boxes size={14} className="absolute left-3 text-gray-300" />
                                        <select
                                            value={selectedTimber}
                                            onChange={(e) => setSelectedTimber(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-white"
                                        >
                                            <option value="">Select available timber...</option>
                                            {myTimber.filter(t => !t.timberUsed).map(t => (
                                                <option key={t.id} value={t.id}>{t.id} — {t.timberBatchID}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Notes — furniture name, wood type, etc. */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">Product Notes</label>
                                    <div className="relative flex items-center">
                                        <Package size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Oak Dining Table | Teak | 4-seater"
                                            value={productNotes}
                                            onChange={(e) => setProductNotes(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                {/* Success / Error feedback */}
                                {createHash && (
                                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                        <p className="text-xs text-emerald-700 font-mono truncate">Registered! Tx: {createHash.slice(0, 20)}...</p>
                                    </div>
                                )}
                                {createError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <AlertCircle size={14} className="text-red-400 shrink-0" />
                                        <p className="text-xs text-red-600 truncate">{createError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCreateProduct}
                                    disabled={createLoading || !selectedTimber}
                                    className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ShieldCheck size={15} />
                                    {createLoading ? "Registering..." : "Register to Blockchain"}
                                </button>
                            </div>
                        </div>

                        {/* Finished products list */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Registered" title="Finished Products on Blockchain" />
                            <div className="space-y-3">
                                {finishedProducts.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-8">No finished products yet. Create one using available timber.</p>
                                ) : finishedProducts.map((p) => (
                                    <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 font-mono">{p.id}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{p.timestamp}</p>
                                            </div>
                                            <StatusBadge status={p.status} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Boxes size={11} className="text-gray-300" />
                                            <span className="text-[11px] text-gray-400">Source Timber: {p.timberBatchID}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "dispatch" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Transfer" title="Dispatch to Distributor" />

                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product ID", "Source Timber", "Created On", "Status", "Select"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingProducts ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">Loading from blockchain...</td></tr>
                                    ) : finishedProducts.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">No finished products to dispatch.</td></tr>
                                    ) : finishedProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedFinishedProduct(p.id)}
                                            className={`cursor-pointer transition-colors ${selectedFinishedProduct === p.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                                        >
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{p.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium">{p.timberBatchID}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{p.timestamp}</td>
                                            <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                                            <td className="py-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedFinishedProduct === p.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Success / Error */}
                        {txHash && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                <p className="text-xs text-emerald-700 font-mono truncate">Dispatched! Tx: {txHash.slice(0, 20)}...</p>
                            </div>
                        )}
                        {txError && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl">
                                <AlertCircle size={14} className="text-red-400 shrink-0" />
                                <p className="text-xs text-red-600 truncate">{txError}</p>
                            </div>
                        )}

                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-700">
                                    {selectedFinishedProduct ? `Selected: ${selectedFinishedProduct}` : "Select a product above"}
                                </p>
                                <p className="text-xs text-indigo-400 mt-0.5">Dispatching transfers ownership to the Distributor wallet on-chain.</p>
                            </div>
                            <button
                                onClick={handleDispatchToDistributor}
                                disabled={txLoading || !selectedFinishedProduct}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                            >
                                {txLoading ? "Dispatching..." : "Dispatch"} <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ PRODUCTION RECORDS ════════════════════════════════════ */}
                {activeTab === "records" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Blockchain Ledger" title="Production Records" />

                        <div className="space-y-4">
                            {allHistory.map((entry, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                                <ShieldCheck size={14} className="text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">Record #{i + 1}</span>
                                            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Confirmed</span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> {entry.timestamp}
                                        </span>
                                    </div>
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
                                { icon: <Cpu size={13} />, label: "Smart contract verified" },
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