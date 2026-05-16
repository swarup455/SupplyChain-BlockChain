import { useState, useRef, useEffect } from "react";
import {
    QrCode, Download, Share2, ShieldCheck, Hash,
    Package, CheckCircle2, ExternalLink, Copy, X, ChevronRight
} from "lucide-react";

// ── QR generation via Google Charts API (no extra deps) ─────────────────────
function QRImage({ value, size = 180 }) {
    const encoded = encodeURIComponent(value);
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=3730a3&qzone=2&format=png`;
    return (
        <img
            src={src}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded-xl"
        />
    );
}

// ── Single product QR card ────────────────────────────────────────────────────
function QRCard({ product, verifyBaseUrl, onExpand }) {
    const verifyUrl = `${verifyBaseUrl}?id=${product.id}`;
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(verifyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const statusColor = {
        "in-stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
        "low-stock": "bg-amber-50 text-amber-600 border-amber-100",
        "sold-out": "bg-red-50 text-red-500 border-red-100",
    };
    const statusLabel = {
        "in-stock": "In Stock",
        "low-stock": "Low Stock",
        "sold-out": "Sold Out",
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package size={16} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{product.id}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[product.status]}`}>
                    {statusLabel[product.status]}
                </span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="relative">
                    <QRImage value={verifyUrl} size={150} />
                    {/* Center logo overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* URL preview */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 mb-3">
                <ExternalLink size={11} className="text-gray-400 shrink-0" />
                <p className="text-[10px] text-gray-500 truncate font-mono flex-1">{verifyUrl}</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={copyLink}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                    onClick={() => onExpand(product)}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                    <QrCode size={13} /> Full View
                </button>
            </div>
        </div>
    );
}

// ── Full-screen QR modal ──────────────────────────────────────────────────────
function QRModal({ product, verifyBaseUrl, onClose }) {
    const verifyUrl = `${verifyBaseUrl}?id=${product.id}`;
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(verifyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Download via canvas trick
    const downloadQR = () => {
        const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=3730a3&qzone=3&format=png`;
        const a = document.createElement("a");
        a.href = imgUrl;
        a.download = `QR_${product.id}.png`;
        a.target = "_blank";
        a.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                    <X size={15} className="text-gray-500" />
                </button>

                {/* Title */}
                <div className="text-center mb-5">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest mb-2">
                        <ShieldCheck size={10} /> Blockchain Verified
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{product.id}</p>
                </div>

                {/* Large QR */}
                <div className="flex justify-center mb-5 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <div className="relative">
                        <QRImage value={verifyUrl} size={220} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <ShieldCheck size={18} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <Hash size={12} className="text-gray-400 shrink-0" />
                        <p className="text-[11px] font-mono text-gray-500 truncate">{product.hash}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <ExternalLink size={12} className="text-gray-400 shrink-0" />
                        <p className="text-[11px] font-mono text-gray-500 truncate flex-1">{verifyUrl}</p>
                    </div>
                </div>

                {/* Scan instruction */}
                <p className="text-center text-[11px] text-gray-400 mb-5 leading-relaxed">
                    Customers scan this code to instantly retrieve the full blockchain history of this product.
                </p>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={copyLink}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                        {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                        onClick={downloadQR}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        <Download size={14} /> Download QR
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Customer Verify Page Preview ──────────────────────────────────────────────
function VerifyPagePreview({ product }) {
    const stages = [
        { stage: "Timber Registration", owner: "SUP01", date: "01-01-2026", hash: "0x58ac2345bdf" },
        { stage: "Production Completed", owner: "MFG01", date: "05-01-2026", hash: "0xA45F89B21C" },
        { stage: "Dispatched for Distribution", owner: "DIST01", date: "10-01-2026", hash: "0xB98D72KLM4" },
        { stage: "Retail Store Inventory", owner: "RET01", date: "10-05-2026", hash: "0xD78F12QRS9" },
    ];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                    Customer View
                </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Verify Page Preview</h2>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                When a customer scans the QR code, they land on this verification page showing the full blockchain history.
            </p>

            {/* Mock verify page */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Mock browser bar */}
                <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                    </div>
                    <div className="flex-1 bg-white rounded-md px-2 py-1 text-[10px] text-gray-400 font-mono">
                        trackchain.app/verify?id={product?.id ?? "DT2026-001"}
                    </div>
                </div>

                {/* Page content */}
                <div className="p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-emerald-700">{product?.name ?? "Oak Dining Table"}</p>
                            <p className="text-[10px] text-emerald-500">{product?.id ?? "DT2026-001"} · Verified on blockchain</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {stages.map((h, i) => (
                            <div key={i} className="flex gap-2">
                                <div className="flex flex-col items-center">
                                    <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
                                        <ShieldCheck size={10} className="text-white" />
                                    </div>
                                    {i < stages.length - 1 && <div className="w-px flex-1 bg-indigo-100 mt-0.5" />}
                                </div>
                                <div className="pb-2">
                                    <p className="text-[11px] font-semibold text-gray-900">{h.stage}</p>
                                    <p className="text-[10px] text-gray-400">{h.owner} · {h.date}</p>
                                    <p className="text-[9px] font-mono text-gray-300 mt-0.5">{h.hash}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <ShieldCheck size={11} className="text-indigo-500 shrink-0" />
                        <p className="text-[10px] text-indigo-600">Complete supply chain history · Immutable blockchain ledger</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const INVENTORY = [
    { id: "DT2026-001", name: "Oak Dining Table", material: "TMB-1001", qty: 10, arrivalDate: "10 May 2026", hash: "0xA45F89B21C", status: "in-stock" },
    { id: "DT2026-002", name: "Teak Wardrobe", material: "TMB-1002", qty: 4, arrivalDate: "12 May 2026", hash: "0xB98D72KLM4", status: "low-stock" },
    { id: "DT2026-003", name: "Walnut Bookshelf", material: "TMB-1001", qty: 0, arrivalDate: "08 May 2026", hash: "0xC12E45NOP7", status: "sold-out" },
];

export default function ProductQRGenerator() {
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [previewProduct, setPreviewProduct] = useState(INVENTORY[0]);
    const verifyBaseUrl = "https://trackchain.app/verify";

    return (
        <div className="min-h-screen bg-[#f5f5f7] p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                        <QrCode size={12} /> QR Code Generator
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Product QR Codes</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Generate and share QR codes for each product. Customers scan to verify blockchain history.
                    </p>
                </div>

                {/* How it works banner */}
                <div className="bg-white border border-indigo-100 rounded-2xl p-5 mb-7 flex flex-wrap gap-4 items-center">
                    {[
                        { step: "1", label: "Generate QR", desc: "Each product gets a unique QR code" },
                        { step: "2", label: "Attach to Product", desc: "Print & stick on the furniture label" },
                        { step: "3", label: "Customer Scans", desc: "Opens the verification page instantly" },
                        { step: "4", label: "Blockchain History", desc: "Full supply chain shown to customer" },
                    ].map((s, i) => (
                        <div key={s.step} className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {s.step}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                                    <p className="text-[11px] text-gray-400">{s.desc}</p>
                                </div>
                            </div>
                            {i < 3 && <ChevronRight size={14} className="text-gray-300 shrink-0 hidden sm:block" />}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">

                    {/* QR Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-700">Inventory Products</h2>
                            <span className="text-xs text-gray-400">{INVENTORY.length} products</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {INVENTORY.map((product) => (
                                <div key={product.id} onClick={() => setPreviewProduct(product)} className="cursor-pointer">
                                    <QRCard
                                        product={product}
                                        verifyBaseUrl={verifyBaseUrl}
                                        onExpand={(p) => setExpandedProduct(p)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Integration note */}
                        <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Integration Note</p>
                            <p className="text-[11px] text-amber-600 leading-relaxed">
                                To use in your app, install <code className="bg-amber-100 px-1 rounded font-mono">qrcode.react</code> or <code className="bg-amber-100 px-1 rounded font-mono">react-qr-code</code> and pass the verify URL as the value prop. The base URL should point to your deployed verify page.
                            </p>
                            <code className="block mt-2 text-[10px] bg-amber-100 text-amber-800 px-2 py-1.5 rounded-lg font-mono">
                                npm install react-qr-code
                            </code>
                        </div>
                    </div>

                    {/* Verify page preview */}
                    <VerifyPagePreview product={previewProduct} />
                </div>
            </div>

            {/* Modal */}
            {expandedProduct && (
                <QRModal
                    product={expandedProduct}
                    verifyBaseUrl={verifyBaseUrl}
                    onClose={() => setExpandedProduct(null)}
                />
            )}
        </div>
    );
}