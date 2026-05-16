import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Search, CheckCircle2, AlertCircle,
    Hash, Package, Truck, Factory, Store, User,
    Activity, ChevronRight, ExternalLink, Clock,
    ArrowLeft
} from "lucide-react";

// ── Mock blockchain data ──────────────────────────────────────────────────────
const BLOCKCHAIN_DATA = {
    "DT2026-001": {
        id: "DT2026-001",
        name: "Oak Dining Table",
        material: "TMB-1001",
        forest: "Assam Forest Zone",
        certification: "FSC Approved",
        manufacturer: "MFG01",
        verified: true,
        history: [
            {
                stage: "Timber Registration",
                owner: "SUP01",
                role: "Timber Supplier",
                date: "01-01-2026",
                time: "09:15 AM",
                hash: "0x58ac2345bdf9e1c3a7f2b8d4e6f0a1b2",
                details: "Timber harvested from certified Assam Forest Zone. FSC approved batch TMB-1001.",
                icon: "supplier",
            },
            {
                stage: "Production Completed",
                owner: "MFG01",
                role: "Furniture Manufacturer",
                date: "05-01-2026",
                time: "10:35 AM",
                hash: "0xA45F89B21C7d3e5f9a0b1c2d4e6f8a9b",
                details: "Timber converted into finished Oak Dining Table. Quality inspection passed.",
                icon: "manufacturer",
            },
            {
                stage: "Dispatched for Distribution",
                owner: "DIST01",
                role: "Distributor",
                date: "10-01-2026",
                time: "02:15 PM",
                hash: "0xB98D72KLM4c5d6e7f8a9b0c1d2e3f4a5",
                details: "Shipment SHP001 dispatched via truck. Transport mode: Road freight.",
                icon: "distributor",
            },
            {
                stage: "Retail Store Inventory",
                owner: "RET01",
                role: "Retailer",
                date: "10-05-2026",
                time: "11:00 AM",
                hash: "0xD78F12QRS9b0c1d2e3f4a5b6c7d8e9f0",
                details: "Product received and added to retail inventory. Ready for sale.",
                icon: "retailer",
            },
        ],
    },
    "DT2026-002": {
        id: "DT2026-002",
        name: "Teak Wardrobe",
        material: "TMB-1002",
        forest: "West Bengal Reserve",
        certification: "FSC Approved",
        manufacturer: "MFG01",
        verified: true,
        history: [
            {
                stage: "Timber Registration",
                owner: "SUP01",
                role: "Timber Supplier",
                date: "03-01-2026",
                time: "08:45 AM",
                hash: "0x72bc1234aef8d2c4b6e0f1a3d5g7h9i1",
                details: "Teak timber sourced from West Bengal Reserve Forest. FSC batch TMB-1002.",
                icon: "supplier",
            },
            {
                stage: "Production Completed",
                owner: "MFG01",
                role: "Furniture Manufacturer",
                date: "08-01-2026",
                time: "03:20 PM",
                hash: "0xC34G56HIJ2k3l4m5n6o7p8q9r0s1t2u3",
                details: "Teak Wardrobe manufactured and quality-tested. Assembly completed.",
                icon: "manufacturer",
            },
            {
                stage: "Dispatched for Distribution",
                owner: "DIST01",
                role: "Distributor",
                date: "14-01-2026",
                time: "10:00 AM",
                hash: "0xE56K78MNO3p4q5r6s7t8u9v0w1x2y3z4",
                details: "Shipment SHP002 dispatched. Estimated delivery 5 days.",
                icon: "distributor",
            },
            {
                stage: "Retail Store Inventory",
                owner: "RET01",
                role: "Retailer",
                date: "12-05-2026",
                time: "09:30 AM",
                hash: "0xF78P90RST4u5v6w7x8y9z0a1b2c3d4e5",
                details: "Received at retail store. Inventory updated.",
                icon: "retailer",
            },
        ],
    },
};

// ── Stage icon map ────────────────────────────────────────────────────────────
function StageIcon({ type, size = 16 }) {
    const icons = {
        supplier: <Package size={size} />,
        manufacturer: <Factory size={size} />,
        distributor: <Truck size={size} />,
        retailer: <Store size={size} />,
        customer: <User size={size} />,
    };
    return icons[type] ?? <Activity size={size} />;
}

// ── Truncate hash for mobile ──────────────────────────────────────────────────
function shortHash(hash) {
    return hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-6 bg-gray-100 rounded-xl w-1/2" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VerifyProduct() {
    const [searchParams] = useSearchParams();
    const [inputId, setInputId] = useState(searchParams.get("id") ?? "");
    const [result, setResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedStep, setExpandedStep] = useState(null);
    const navigate = useNavigate();
    
    // Auto-verify if ?id= is in URL (QR scan flow)
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setInputId(id);
            runVerify(id);
        }
    }, []);

    const runVerify = (id) => {
        const query = (id ?? inputId).trim().toUpperCase();
        if (!query) return;
        setLoading(true);
        setNotFound(false);
        setResult(null);
        setSearched(false);
        setExpandedStep(null);

        // Simulate blockchain fetch delay
        setTimeout(() => {
            const data = BLOCKCHAIN_DATA[query];
            if (data) {
                setResult(data);
            } else {
                setNotFound(true);
            }
            setLoading(false);
            setSearched(true);
        }, 1200);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") runVerify();
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7]">

            {/* ── Topbar ── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <ShieldCheck size={17} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">Trackchain</span>
                        <span className="hidden sm:block text-gray-300 mx-1">|</span>
                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Product Verification</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Blockchain Live
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-5 py-10">

                <button onClick={() => navigate("/")} className="bg-indigo-50 border border-indigo-100 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-indigo-500 text-sm">
                    <ArrowLeft size={14} />
                    Back To Home
                </button>

                {/* ── Hero ── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                        <ShieldCheck size={12} /> Authenticity Verification
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Product</h1>
                    <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                        Enter the Product ID from your furniture label or scan the QR code to retrieve its complete blockchain history.
                    </p>
                </div>

                {/* ── Search box ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Product ID
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                placeholder="e.g. DT2026-001"
                                value={inputId}
                                onChange={(e) => {
                                    setInputId(e.target.value);
                                    setNotFound(false);
                                    setResult(null);
                                    setSearched(false);
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => runVerify()}
                            disabled={loading || !inputId.trim()}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
                        >
                            <ShieldCheck size={15} />
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </div>

                    {/* Try examples */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[11px] text-gray-400">Try:</span>
                        {["DT2026-001", "DT2026-002"].map((id) => (
                            <button
                                key={id}
                                onClick={() => { setInputId(id); runVerify(id); }}
                                className="text-[11px] font-mono text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            <span className="text-xs text-gray-400 ml-1">Fetching blockchain records...</span>
                        </div>
                        <Skeleton />
                    </div>
                )}

                {/* ── Not found ── */}
                {!loading && notFound && (
                    <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Product Not Found</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            No blockchain record found for <span className="font-mono font-semibold text-gray-600">{inputId}</span>.
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            This may indicate an unregistered or counterfeit product. Please contact the retailer for assistance.
                        </p>
                    </div>
                )}

                {/* ── Result ── */}
                {!loading && result && (
                    <div className="space-y-4">

                        {/* Verified badge */}
                        <div className="bg-white border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} className="text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-base font-bold text-gray-900">{result.name}</h2>
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                        ✓ Blockchain Verified
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">{result.id}</p>
                            </div>
                        </div>

                        {/* Product details */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-4">
                                Product Details
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: "Product ID", value: result.id },
                                    { label: "Material Batch", value: result.material },
                                    { label: "Forest Source", value: result.forest },
                                    { label: "Certification", value: result.certification },
                                    { label: "Manufacturer", value: result.manufacturer },
                                    { label: "Supply Stages", value: `${result.history.length} recorded` },
                                ].map((d) => (
                                    <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{d.label}</p>
                                        <p className="text-xs font-semibold text-gray-800 font-mono truncate">{d.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Blockchain timeline */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-5">
                                Blockchain Ledger
                            </p>
                            <h3 className="text-base font-bold text-gray-900 mb-5">Supply Chain History</h3>

                            <div className="space-y-2">
                                {result.history.map((h, i) => (
                                    <div key={i}>
                                        <button
                                            onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex gap-3 items-start">
                                                {/* Line + icon */}
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                                        <StageIcon type={h.icon} size={15} className="text-white" />
                                                    </div>
                                                    {i < result.history.length - 1 && (
                                                        <div className="w-px flex-1 bg-indigo-100 mt-1 mb-1 min-h-[16px]" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className={`flex-1 pb-3 border rounded-xl px-4 py-3 transition-all ${expandedStep === i ? "border-indigo-200 bg-indigo-50/50" : "border-gray-100 bg-gray-50 hover:border-indigo-100"}`}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{h.stage}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5">{h.role} · {h.owner}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                                                <Clock size={11} />
                                                                <span className="hidden sm:inline">{h.date}</span>
                                                                <span className="sm:hidden">{h.date.slice(0, 5)}</span>
                                                            </div>
                                                            <ChevronRight
                                                                size={14}
                                                                className={`text-gray-400 transition-transform ${expandedStep === i ? "rotate-90" : ""}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Expanded details */}
                                                    {expandedStep === i && (
                                                        <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2">
                                                            <p className="text-xs text-gray-600 leading-relaxed">{h.details}</p>
                                                            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5">
                                                                <Hash size={11} className="text-gray-400 shrink-0" />
                                                                <span className="font-mono text-[10px] text-gray-500 break-all">{h.hash}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={11} className="text-gray-400" />
                                                                <span className="text-[11px] text-gray-400">{h.date} · {h.time}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust footer */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-wrap justify-center gap-6">
                                {[
                                    { icon: <ShieldCheck size={14} />, label: "Immutable Storage" },
                                    { icon: <Activity size={14} />, label: "Real-time Tracking" },
                                    { icon: <CheckCircle2 size={14} />, label: "Tamper-proof Records" },
                                    { icon: <ExternalLink size={14} />, label: "Ethereum Network" },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-1.5 text-gray-400">
                                        {s.icon}
                                        <span className="text-[12px]">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && !searched && !result && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={24} className="text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Ready to Verify</h3>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                            Enter a Product ID above or scan the QR code on your furniture to view its complete blockchain history.
                        </p>
                    </div>
                )}

            </div>

            {/* ── Footer ── */}
            <div className="text-center pb-8">
                <p className="text-[11px] text-gray-400">
                    Powered by <span className="font-semibold text-indigo-500">Trackchain</span> · Blockchain-Based Supply Chain Verification
                </p>
            </div>
        </div>
    );
}