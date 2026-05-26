import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Search, CheckCircle2, AlertCircle,
    Hash, Package, Truck, Factory, Store, User,
    Activity, ChevronRight, ExternalLink, Clock,
    ArrowLeft, Copy, Check, Zap, Globe, Lock
} from "lucide-react";
import { WALLETS } from "../../blockchain/wallets";
import { getProductHistory, getProduct } from "../../blockchain/contract";

const stageConfig = {
    supplier: {
        icon: Package,
        color: "emerald",
        gradient: "from-emerald-500 to-teal-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        glow: "shadow-emerald-200",
        dot: "bg-emerald-400",
    },
    manufacturer: {
        icon: Factory,
        color: "blue",
        gradient: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        glow: "shadow-blue-200",
        dot: "bg-blue-400",
    },
    distributor: {
        icon: Truck,
        color: "amber",
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        glow: "shadow-amber-200",
        dot: "bg-amber-400",
    },
    retailer: {
        icon: Store,
        color: "purple",
        gradient: "from-purple-500 to-violet-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        glow: "shadow-purple-200",
        dot: "bg-purple-400",
    },
    customer: {
        icon: User,
        color: "rose",
        gradient: "from-rose-500 to-pink-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        glow: "shadow-rose-200",
        dot: "bg-rose-400",
    },
};

function getStage(type) {
    return stageConfig[type] ?? {
        icon: Activity,
        color: "slate",
        gradient: "from-slate-500 to-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        glow: "shadow-slate-200",
        dot: "bg-slate-400",
    };
}

function shortWallet(addr) {
    if (!addr) return "—";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getRoleFromWallet(wallet) {
    if (!wallet) return "Unknown";

    const w = wallet.toLowerCase();

    if (w === WALLETS.supplier.toLowerCase())
        return "Supplier";

    if (w === WALLETS.manufacturer.toLowerCase())
        return "Manufacturer";

    if (w === WALLETS.distributor.toLowerCase())
        return "Distributor";

    if (w === WALLETS.retailer.toLowerCase())
        return "Retailer";

    return "Unknown";
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };
    return (
        <button
            onClick={handleCopy}
            className="ml-1.5 p-1 rounded-md hover:bg-white/60 transition-colors text-current opacity-60 hover:opacity-100"
            title="Copy address"
        >
            {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="h-28 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
            </div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
            ))}
        </div>
    );
}

function DetailCard({ label, value, icon: Icon, accent = "indigo" }) {
    const accents = {
        indigo: "from-indigo-500/10 to-violet-500/5 border-indigo-100 text-indigo-600",
        emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-100 text-emerald-600",
        blue: "from-blue-500/10 to-cyan-500/5 border-blue-100 text-blue-600",
        amber: "from-amber-500/10 to-orange-500/5 border-amber-100 text-amber-600",
        purple: "from-purple-500/10 to-violet-500/5 border-purple-100 text-purple-600",
        rose: "from-rose-500/10 to-pink-500/5 border-rose-100 text-rose-600",
    };
    return (
        <div className={`bg-gradient-to-br ${accents[accent]} border rounded-2xl p-5 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-3">
                {Icon && <Icon size={14} className="opacity-70" />}
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
            </div>
            <p className="text-sm font-bold font-mono leading-snug break-all">{value ?? "—"}</p>
        </div>
    );
}

export default function VerifyProduct() {
    const [result, setResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedStep, setExpandedStep] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [inputId, setInputId] = useState(searchParams.get("id") ?? "");

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setInputId(id);
            runVerify(id);
        }
    }, []);

    const runVerify = async (id) => {
        const query = (id ?? inputId).trim().toUpperCase();
        if (!query) return;
        setLoading(true);
        setNotFound(false);
        setResult(null);
        setSearched(false);
        setExpandedStep(null);

        try {
            const product = await getProduct(query);
            const history = await getProductHistory(query);
            const enrichedHistory = history.map((h) => ({
                ...h,
                role: getRoleFromWallet(h.actor),
                icon: getRoleFromWallet(h.actor).toLowerCase(),
            }));

            if (!product.exists) {
                setNotFound(true);
            } else {
                setResult({
                    id: product.productID,
                    name: `Furniture Product ${product.productID}`,
                    material: product.timberBatchID,
                    verified: true,
                    history: enrichedHistory,
                });
            }
        } catch (err) {
            console.error(err);
            setNotFound(true);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") runVerify();
    };

    return (
        <div className="min-h-screen bg-[#f4f5f9]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #d1d5e0 1px, transparent 0)", backgroundSize: "28px 28px" }}>

            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900 text-lg tracking-tight">Trackchain</span>
                        <span className="text-slate-200 mx-1">|</span>
                        <span className="text-xs text-slate-400 font-medium hidden sm:block">Verification Explorer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-semibold">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Ethereum Mainnet
                        </span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">

                <button
                    onClick={() => navigate("/")}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 sm:p-12 shadow-2xl shadow-indigo-200">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 text-xs text-indigo-200 font-semibold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest backdrop-blur-sm">
                            <Lock size={11} />
                            Immutable Blockchain Records
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Verify Product Authenticity</h1>
                        <p className="text-indigo-200 text-sm max-w-lg leading-relaxed">
                            Enter your Product ID or scan the QR code on your furniture label to retrieve its cryptographically secured supply chain history.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-6 mb-8 shadow-sm shadow-slate-100">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Product Identifier
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
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
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 font-mono placeholder:text-slate-300 placeholder:font-sans focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all bg-slate-50/50"
                            />
                        </div>
                        <button
                            onClick={() => runVerify()}
                            disabled={loading || !inputId.trim()}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <ShieldCheck size={15} />
                            {loading ? "Verifying…" : "Verify"}
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="text-[11px] text-slate-400 font-medium">Quick test:</span>
                        {["DT2026-001", "DT2026-002"].map((id) => (
                            <button
                                key={id}
                                onClick={() => { setInputId(id); runVerify(id); }}
                                className="text-[11px] font-mono text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-1">
                                {[0, 150, 300].map(d => (
                                    <div key={d} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                ))}
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Querying blockchain records…</span>
                        </div>
                        <Skeleton />
                    </div>
                )}

                {!loading && notFound && (
                    <div className="bg-white rounded-3xl border border-red-100 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Product Not Found</h3>
                        <p className="text-sm text-slate-500 mb-3">
                            No blockchain record exists for <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">{inputId}</span>
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            This product may not be registered on-chain, or the ID may be incorrect. Contact your retailer if you believe this is an error.
                        </p>
                    </div>
                )}

                {!loading && result && (
                    <div className="space-y-6">

                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 flex items-center gap-5 shadow-sm shadow-emerald-100">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                                <CheckCircle2 size={26} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <h2 className="text-xl font-bold text-slate-900">{result.name}</h2>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 size={10} /> Blockchain Verified
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-mono">{result.id}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-white/70 border border-emerald-100 px-4 py-2 rounded-xl">
                                <Zap size={12} />
                                {result.history.length} chain events
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                    On-Chain Product Details
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DetailCard label="Product ID" value={result.id} icon={Hash} accent="indigo" />
                                <DetailCard label="Timber Batch ID" value={result.material} icon={Package} accent="emerald" />
                                <DetailCard label="Current Stage" value={result.history[result.history.length - 1]?.stage ?? "—"} icon={Activity} accent="blue" />
                                <DetailCard label="Total Supply Stages" value={`${result.history.length} recorded events`} icon={Globe} accent="purple" />
                                <DetailCard label="Current Owner" value={shortWallet(result.history[result.history.length - 1]?.actor)} icon={User} accent="amber" />
                                <DetailCard
                                    label="Supplier"
                                    value={
                                        shortWallet(
                                            result.history.find(h => h.role === "Supplier")?.actor
                                        )
                                    }
                                    icon={Package}
                                    accent="emerald"
                                />

                                <DetailCard
                                    label="Manufacturer"
                                    value={
                                        shortWallet(
                                            result.history.find(h => h.role === "Manufacturer")?.actor
                                        )
                                    }
                                    icon={Factory}
                                    accent="blue"
                                />

                                <DetailCard
                                    label="Distributor"
                                    value={
                                        shortWallet(
                                            result.history.find(h => h.role === "Distributor")?.actor
                                        )
                                    }
                                    icon={Truck}
                                    accent="amber"
                                />

                                <DetailCard
                                    label="Retailer"
                                    value={
                                        shortWallet(
                                            result.history.find(h => h.role === "Retailer")?.actor
                                        )
                                    }
                                    icon={Store}
                                    accent="purple"
                                />
                                <DetailCard label="Verification Status" value="Cryptographically Verified" icon={ShieldCheck} accent="rose" />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 inline-block mb-3">
                                        Blockchain Ledger
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900">Supply Chain History</h3>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                                    <Lock size={11} />
                                    Tamper-proof
                                </div>
                            </div>

                            <div className="space-y-3">
                                {result.history.map((h, i) => {
                                    const cfg = getStage(h.icon);
                                    const StageIconComp = cfg.icon;
                                    const isExpanded = expandedStep === i;
                                    const isLast = i === result.history.length - 1;

                                    return (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center shrink-0 pt-1">
                                                <div className={`w-11 h-11 bg-gradient-to-br ${cfg.gradient} rounded-2xl flex items-center justify-center shadow-lg ${cfg.glow} shrink-0`}>
                                                    <StageIconComp size={18} className="text-white" />
                                                </div>
                                                {!isLast && (
                                                    <div className={`w-0.5 flex-1 mt-2 mb-1 min-h-[20px] bg-gradient-to-b ${cfg.gradient} opacity-30 rounded-full`} />
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setExpandedStep(isExpanded ? null : i)}
                                                className="w-full text-left mb-2"
                                            >
                                                <div className={`border rounded-2xl px-5 py-4 transition-all duration-200 ${isExpanded ? `${cfg.border} ${cfg.bg}` : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white"}`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                                <p className="text-sm font-bold text-slate-900">{h.stage}</p>
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                                    {h.role ?? h.icon}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                                    <CheckCircle2 size={9} /> Verified
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[11px] font-mono text-slate-500 bg-white/80 border border-slate-100 px-2 py-0.5 rounded-lg">
                                                                    {h.actor ? shortWallet(h.actor) : (h.owner ?? "—")}
                                                                </span>
                                                                {h.actor && <CopyButton text={h.actor} />}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-white border border-slate-100 px-2.5 py-1.5 rounded-lg">
                                                                <Clock size={10} />
                                                                <span className="hidden sm:inline">{h.timestamp}</span>
                                                            </div>
                                                            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${isExpanded ? `${cfg.border} ${cfg.bg}` : "border-slate-100 bg-white"}`}>
                                                                <ChevronRight size={13} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="mt-4 pt-4 space-y-3" style={{ borderColor: "currentColor", opacity: 1 }}>
                                                            <div className={`border-t ${cfg.border} opacity-50`} />
                                                            {h.details && (
                                                                <p className="text-xs text-slate-600 leading-relaxed">{h.details}</p>
                                                            )}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {h.actor && (
                                                                    <div className="flex items-start gap-2 bg-white/70 border border-slate-100 rounded-xl px-3 py-2.5">
                                                                        <User size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Wallet Address</p>
                                                                            <div className="flex items-center gap-1">
                                                                                <p className="font-mono text-[11px] text-slate-700 break-all">{h.actor}</p>
                                                                                <CopyButton text={h.actor} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {h.hash && (
                                                                    <div className="flex items-start gap-2 bg-white/70 border border-slate-100 rounded-xl px-3 py-2.5">
                                                                        <Hash size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">TX Hash</p>
                                                                            <div className="flex items-center gap-1">
                                                                                <p className="font-mono text-[11px] text-slate-700 break-all">{h.hash}</p>
                                                                                <CopyButton text={h.hash} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                                <Clock size={11} />
                                                                {h.timestamp}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                                {[
                                    { icon: <ShieldCheck size={15} />, label: "Immutable Storage", color: "text-indigo-500" },
                                    { icon: <Activity size={15} />, label: "Real-time Tracking", color: "text-emerald-500" },
                                    { icon: <CheckCircle2 size={15} />, label: "Tamper-proof Records", color: "text-blue-500" },
                                    { icon: <ExternalLink size={15} />, label: "Ethereum Network", color: "text-violet-500" },
                                ].map((s) => (
                                    <div key={s.label} className={`flex items-center gap-2 ${s.color}`}>
                                        {s.icon}
                                        <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {!loading && !searched && !result && (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <ShieldCheck size={28} className="text-indigo-400" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-2">Ready to Verify</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                            Enter a Product ID above or scan the QR code on your furniture label to view its complete blockchain provenance.
                        </p>
                    </div>
                )}

            </div>

            <div className="text-center pb-10">
                <p className="text-[11px] text-slate-400">
                    Powered by <span className="font-bold text-indigo-500">Trackchain</span> · Blockchain Supply Chain Verification
                </p>
            </div>

        </div>
    );
}