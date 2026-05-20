import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import { useState, useEffect } from "react";
import { transferOwnership, getProductHistory } from "../../blockchain/contract";
import { getWalletAddress, onAccountChange } from "../../blockchain/provider";
import { WALLETS } from "../../blockchain/wallets";
import {
    ShieldCheck, Truck, Package, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, ChevronRight, Activity, Hash, Calendar,
    User, MapPin, Navigation, Store
} from "lucide-react";

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
    const [walletAddress, setWalletAddress] = useState("");

    // Products currently owned by distributor
    const [myProducts, setMyProducts] = useState([]);
    // All history of FP- products that passed through distributor
    const [allHistory, setAllHistory] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [dispatchedCount, setDispatchedCount] = useState(0);

    // Dispatch states
    const [selectedProduct, setSelectedProduct] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [txError, setTxError] = useState("");

    const STATS = [
        {
            label: "Products Received",
            value: myProducts.length.toString(),
            sub: "From manufacturer",
            icon: <Package size={18} />,
            color: "bg-sky-50 text-sky-600"
        },
        {
            label: "Dispatched to Retailer",
            value: dispatchedCount.toString(),
            sub: "Transferred",
            icon: <Truck size={18} />,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            label: "Pending Dispatch",
            value: myProducts.length.toString(),
            sub: "Awaiting transfer",
            icon: <Navigation size={18} />,
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

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
        { id: "received", label: "Received Products", icon: <Package size={15} /> },
        { id: "dispatch", label: "Dispatch to Retailer", icon: <Truck size={15} /> },
        { id: "records", label: "Shipment Records", icon: <ClipboardList size={15} /> },
    ];

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    // Check wallet role
    useEffect(() => {
        const checkRole = async () => {
            try {
                const address = await getWalletAddress();
                setWalletAddress(address);
                if (address.toLowerCase() !== WALLETS.distributor.toLowerCase()) {
                    alert("⚠️ Please switch MetaMask to the Distributor account!");
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkRole();
        onAccountChange((newAddress) => setWalletAddress(newAddress));
    }, []);

    // Fetch products from blockchain
    useEffect(() => {
        const fetchProducts = async () => {
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

                // Products currently owned by distributor
                const mine = allProducts
                    .filter(p => p.currentOwner.toLowerCase() === WALLETS.distributor.toLowerCase())
                    .map(p => ({
                        id: p.productID,
                        timberBatchID: p.timberBatchID,
                        stage: Number(p.stage),
                        currentOwner: p.currentOwner,
                        timestamp: new Date(Number(p.timestamp) * 1000).toLocaleDateString(),
                        status: "received",
                    }));

                // Count all FP- products that have been dispatched by distributor (stage > 2)
                const dispatched = allProducts.filter(p =>
                    p.productID.startsWith("FP-") && Number(p.stage) > 2
                );

                setMyProducts(mine);
                setDispatchedCount(dispatched.length);

            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (window.ethereum) fetchProducts();
    }, [txHash]);

    // Fetch history for all FP- products
    useEffect(() => {
        const fetchHistory = async () => {
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

                const fpIDs = ids.filter(Boolean).filter(id => id.startsWith("FP-"));
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
    }, [txHash]);

    // Dispatch to retailer
    const handleDispatchToRetailer = async () => {
        if (!selectedProduct) return;
        setTxLoading(true);
        setTxError("");
        setTxHash("");
        try {
            const hash = await transferOwnership(
                selectedProduct,
                WALLETS.retailer,
                "Dispatched to Retailer"
            );
            setTxHash(hash);
            setSelectedProduct("");
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
                                {myProducts.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">No products received yet.</p>
                                ) : myProducts.slice(0, 3).map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-sky-600" />
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
                                        {["Product ID", "Source Timber", "Received On", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingProducts ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-xs text-gray-400">Loading from blockchain...</td></tr>
                                    ) : myProducts.length === 0 ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-xs text-gray-400">No products received yet.</td></tr>
                                    ) : myProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md">{p.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium">{p.timberBatchID}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{p.timestamp}</td>
                                            <td className="py-3"><StatusBadge status={p.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-xs text-gray-400">
                                Products listed here are currently owned by your wallet on-chain.
                                Go to <span className="text-indigo-500 font-semibold cursor-pointer"
                                    onClick={() => setActiveTab("dispatch")}>Dispatch to Retailer</span> to transfer them forward.
                            </p>
                        </div>
                    </div>
                )}

                {/* ══ DISPATCH TO RETAILER ══════════════════════════════════ */}
                {activeTab === "dispatch" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Transfer" title="Dispatch to Retailer" />
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product ID", "Source Timber", "Received On", "Status", "Select"].map((h) => (
                                            <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loadingProducts ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">Loading from blockchain...</td></tr>
                                    ) : myProducts.length === 0 ? (
                                        <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-400">No products to dispatch.</td></tr>
                                    ) : myProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedProduct(p.id)}
                                            className={`cursor-pointer transition-colors ${selectedProduct === p.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                                        >
                                            <td className="py-3 pr-4">
                                                <span className="font-mono text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md">{p.id}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-gray-600 font-medium">{p.timberBatchID}</td>
                                            <td className="py-3 pr-4 text-xs text-gray-400">{p.timestamp}</td>
                                            <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                                            <td className="py-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedProduct === p.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

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
                                    {selectedProduct ? `Selected: ${selectedProduct}` : "Select a product above"}
                                </p>
                                <p className="text-xs text-indigo-400 mt-0.5">Dispatching transfers ownership to the Retailer wallet on-chain.</p>
                            </div>
                            <button
                                onClick={handleDispatchToRetailer}
                                disabled={txLoading || !selectedProduct}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                            >
                                {txLoading ? "Dispatching..." : "Dispatch to Retailer"} <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ SHIPMENT RECORDS ══════════════════════════════════════ */}
                {activeTab === "records" && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6">
                        <SectionHeader label="Blockchain Ledger" title="Distribution Records" />
                        <div className="space-y-4">
                            {allHistory.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-8">No records yet.</p>
                            ) : allHistory.map((entry, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                                                <Truck size={14} className="text-white" />
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