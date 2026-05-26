import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/authSlice";
import QRCode from "react-qr-code";
import {
    ShieldCheck, Package, ClipboardList, TrendingUp,
    ArrowRight, LogOut, Clock, CheckCircle2, AlertCircle,
    BarChart3, Boxes, Store, ChevronRight, Activity,
    Hash, User, QrCode, Truck, X, ExternalLink,
    Tag, Layers, BadgeCheck, Download
} from "lucide-react";
import { getWalletAddress, onAccountChange } from "../../blockchain/provider";
import { WALLETS } from "../../blockchain/wallets";

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

// ── Sold / Unsold toggle badge ──────────────────────────────────────────────
function SoldToggle({ sold, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all
                ${sold
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${sold ? "bg-rose-500" : "bg-gray-400"}`} />
            {sold ? "Sold" : "Unsold"}
        </button>
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

// ── QR Modal ───────────────────────────────────────────────────────────────
function QRModal({ product, onClose }) {
    if (!product) return null;

    const downloadQR = () => {
        const svg = document.getElementById("retailer-qr-code");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${product.id}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-5 relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-widest">Trackchain</span>
                        <div className="ml-auto flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
                            <BadgeCheck size={11} className="text-emerald-300" />
                            <span className="text-[10px] font-semibold text-emerald-200 whitespace-nowrap">Blockchain Verified</span>
                        </div>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">{product.name}</p>

                    {/* Highlighted Product ID — amber */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 font-mono font-bold text-sm px-3 py-1 rounded-lg">
                            <Tag size={11} />
                            {product.id}
                        </span>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-4">

                    {/* QR + ID row */}
                    <div className="flex items-center gap-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
                        {/* QR code */}
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm shrink-0">
                            <QRCode
                                id="retailer-qr-code"
                                value={`${window.location.origin}/verify?id=${product.id}`}
                                size={108}
                            />
                        </div>
                        {/* Right side info */}
                        <div className="min-w-0 flex-1 space-y-2.5">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Scan to verify</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Scan this QR to view the complete blockchain history of this product.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5">
                                <ExternalLink size={10} className="text-indigo-400 shrink-0" />
                                <span className="text-[10px] font-mono text-indigo-500 truncate">
                                    /verify?id={product.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[9px] text-amber-500 uppercase tracking-wider mb-1 font-semibold">Timber Batch</p>
                            <p className="text-xs font-mono font-bold text-amber-800">{product.timberBatch}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Arrived</p>
                            <p className="text-xs font-semibold text-gray-800">{product.arrivalDate}</p>
                        </div>
                        <div className="col-span-2 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">Tx Hash</p>
                            <p className="text-[10px] font-mono text-gray-500 break-all leading-relaxed">{product.hash}</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5 pt-1">
                        <button
                            onClick={downloadQR}
                            className="flex-1 py-2.5 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Download size={13} />
                            Download QR
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function RetailerDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");
    const [inventory, setInventory] = useState([]);
    const [qrModal, setQrModal] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [incomingProducts, setIncomingProducts] = useState([]);
    const [activity, setActivity] = useState([]);

    const stats = [
        {
            label: "Products in Inventory",
            value: inventory.length.toString(),
            sub: "Blockchain synced",
            icon: <Boxes size={18} />,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            label: "Products Sold",
            value: inventory.filter(p => p.sold).length.toString(),
            sub: "Retail completed",
            icon: <Store size={18} />,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            label: "Unsold Products",
            value: inventory.filter(p => !p.sold).length.toString(),
            sub: "Currently available",
            icon: <Package size={18} />,
            color: "bg-amber-50 text-amber-600"
        },
        {
            label: "Blockchain Records",
            value: inventory.length.toString(),
            sub: "Immutable entries",
            icon: <ShieldCheck size={18} />,
            color: "bg-purple-50 text-purple-600"
        },
    ];

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };

    const toggleSold = (id) => {
        setInventory(prev =>
            prev.map(p => p.id === id ? { ...p, sold: !p.sold } : p)
        );
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
        { id: "incoming", label: "Incoming Shipments", icon: <Truck size={15} /> },
        { id: "inventory", label: "Inventory", icon: <Boxes size={15} /> },
        { id: "qrcodes", label: "QR Codes", icon: <QrCode size={15} /> },
    ];

    useEffect(() => {
        const checkRole = async () => {
            try {
                const address = await getWalletAddress();
                setWalletAddress(address);

                if (
                    address.toLowerCase() !==
                    WALLETS.retailer.toLowerCase()
                ) {
                    alert("Please switch to Retailer wallet");
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkRole();

        onAccountChange((newAddress) =>
            setWalletAddress(newAddress)
        );
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);

            try {
                const { ethers } = await import("ethers");
                const { ABI, CONTRACT_ADDRESS } =
                    await import("../../blockchain/config");

                const provider =
                    new ethers.BrowserProvider(window.ethereum);

                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    ABI,
                    provider
                );

                const ids = await Promise.all(
                    [...Array(50).keys()].map(i =>
                        contract.allProductIDs(i).catch(() => null)
                    )
                );

                const products = await Promise.all(
                    ids.filter(Boolean).map(id =>
                        contract.getProduct(id)
                    )
                );

                const retailerProducts = products
                    .filter(
                        p =>
                            p.currentOwner.toLowerCase() ===
                            WALLETS.retailer.toLowerCase()
                    )
                    .map(p => ({
                        id: p.productID,
                        name: `Furniture Product ${p.productID}`,
                        timberBatch: p.timberBatchID,
                        arrivalDate: new Date(
                            Number(p.timestamp) * 1000
                        ).toLocaleDateString(),
                        hash: "Blockchain Verified",
                        stockStatus: "in-stock",
                        sold: false,
                    }));

                const incoming = retailerProducts.map((p, index) => ({
                    id: p.id,
                    name: p.name,
                    distributor: "Blockchain Distributor",
                    shipment: `SHP-${index + 1}`,
                    qty: 1,
                    date: p.arrivalDate,
                    status: "received",
                }));

                const liveActivity = retailerProducts.map((p) => ({
                    text: `${p.id} synced from blockchain`,
                    time: p.arrivalDate,
                    type: "success",
                }));

                setActivity(liveActivity);

                setIncomingProducts(incoming);

                setInventory(retailerProducts);

            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProducts(false);
            }
        };

        if (window.ethereum) {
            fetchProducts();
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f5f7]">

            {/* QR Modal */}
            <QRModal product={qrModal} onClose={() => setQrModal(null)} />

            {/* ── Topbar ──────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
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
                        Manage inventory, confirm shipments, and generate product QR codes.
                    </p>
                </div>

                {/* ── Stat cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((s) => (
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
                                {inventory.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                                <p className="text-[11px] text-gray-400">{p.id} · Arrived: {p.arrivalDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={p.stockStatus} />
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.sold ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-400"}`}>
                                                {p.sold ? "Sold" : "Unsold"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity feed */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6">
                            <SectionHeader label="Live" title="Activity Feed" />
                            <div className="space-y-4">
                                {activity.map((a, i) => (
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
                                { icon: <Boxes size={20} />, title: "Inventory", desc: "Monitor current stock levels, product details, and sold status.", tab: "inventory", color: "bg-emerald-50 text-emerald-600" },
                                { icon: <QrCode size={20} />, title: "QR Codes", desc: "Generate and view blockchain-verified QR codes for each product.", tab: "qrcodes", color: "bg-purple-50 text-purple-600" },
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
                                    {incomingProducts.map((s) => (
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
                            {inventory.map((p) => (
                                <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{p.id} · Arrived: {p.arrivalDate}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={p.stockStatus} />
                                            <SoldToggle sold={p.sold} onToggle={() => toggleSold(p.id)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Tag size={9} /> Product ID
                                            </p>
                                            <p className="text-xs font-semibold text-gray-800 font-mono">{p.id}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Layers size={9} /> Timber Batch
                                            </p>
                                            <p className="text-xs font-semibold text-gray-800 font-mono">{p.timberBatch}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Hash size={9} /> Tx Hash
                                            </p>
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

                {/* ══ QR CODES ══════════════════════════════════════════════ */}
                {activeTab === "qrcodes" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full">
                                    Product Authentication
                                </span>
                                <h2 className="text-lg font-bold text-gray-900 mt-2">QR Codes</h2>
                            </div>
                            {/* Global verified badge */}
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2">
                                <BadgeCheck size={15} className="text-emerald-500" />
                                <span className="text-xs font-semibold text-emerald-700">Blockchain Verified</span>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {inventory.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group"
                                >
                                    {/* Card header */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 pt-4 pb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-widest">Trackchain</span>
                                            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                                                <BadgeCheck size={10} className="text-emerald-300" />
                                                <span className="text-[9px] font-semibold text-emerald-200">Verified</span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                                        <p className="text-indigo-300 text-[11px] mt-0.5 font-mono">{p.id}</p>
                                    </div>

                                    {/* QR code */}
                                    <div className="flex justify-center -mt-5 mb-3 px-4">
                                        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
                                            <QRCode
                                                value={`${window.location.origin}/verify?id=${p.id}`}
                                                size={80}
                                            />
                                        </div>
                                    </div>

                                    {/* URL pill */}
                                    <div className="mx-4 mb-4">
                                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
                                            <ExternalLink size={10} className="text-indigo-400 shrink-0" />
                                            <span className="text-[10px] font-mono text-indigo-500 truncate">
                                                /verify?id={p.id}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="px-4 pb-4 space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Timber Batch</span>
                                            <span className="text-[11px] font-mono font-semibold text-gray-700">{p.timberBatch}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Tx Hash</span>
                                            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[120px] text-right">{p.hash}</span>
                                        </div>
                                    </div>

                                    {/* View Full QR button */}
                                    <div className="px-4 pb-4">
                                        <button
                                            onClick={() => setQrModal(p)}
                                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <QrCode size={13} />
                                            View Full QR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom note */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                            <ShieldCheck size={13} />
                            <p className="text-xs">All QR codes link to immutable blockchain records via the Trackchain verification portal.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}