import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Package, Cpu, QrCode, ArrowRight, Play,
    TreePine, Factory, Truck, Store, User, Check,
    Menu, X, ChevronRight, Lock, Globe, Leaf
} from "lucide-react";

const NAV_LINKS = [
    { label: "Features", id: "features" },
    { label: "Workflow", id: "workflow" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
];

const FEATURES = [
    {
        icon: <ShieldCheck size={22} />,
        title: "Immutable Blockchain Records",
        desc: "Secure logging of every transaction and movement, ensuring data cannot be altered or deleted after entry.",
    },
    {
        icon: <Package size={22} />,
        title: "Product Traceability",
        desc: "Real-time geographical tracking from the raw timber source to the final delivery at your customer's door.",
    },
    {
        icon: <Cpu size={22} />,
        title: "Smart Contract Verification",
        desc: "Automated fulfillment of agreements between suppliers and retailers, triggered by verified shipment data.",
    },
    {
        icon: <QrCode size={22} />,
        title: "QR Code Authentication",
        desc: "Physical furniture pieces linked to their digital twins via secure QR codes for instant consumer verification.",
    },
    {
        icon: <Lock size={22} />,
        title: "Secure Ownership Transfer",
        desc: "Digital NFTs acting as verifiable certificates of ownership, transferable seamlessly during resale or relocation.",
    },
    {
        icon: <User size={22} />,
        title: "Role-Based Access Control",
        desc: "Permissioned visibility levels for logistics partners, manufacturers, and consumers to protect proprietary data.",
    },
];

const CHAIN = [
    { icon: <TreePine size={20} />, role: "Timber Supplier", desc: "Sustainable harvest logging with GPS-tagged blockchain entry." },
    { icon: <Factory size={20} />, role: "Manufacturer", desc: "Timber processing and production tracking of furniture components." },
    { icon: <Truck size={20} />, role: "Distributor", desc: "Verified shipping with environmental conditions monitoring." },
    { icon: <Store size={20} />, role: "Retailer", desc: "Showroom inventory verification and final prep for customer." },
    { icon: <User size={20} />, role: "Customer", desc: "QR scan verification and certificate of authenticity delivery." },
];

const STATS = [
    { num: "50k+", label: "Verified Transactions" },
    { num: "99.9%", label: "Transparency Rate" },
    { num: "10M+", label: "Secure Records" },
    { num: "1.2M+", label: "Products Verified" },
];

const TRUST_STATS = [
    { num: "100%", label: "Eco-Audited" },
    { num: "Zero", label: "Illegal Logging" },
    { num: "Global", label: "Partner Network" },
];

const FOOTER_LINKS = {
    Product: ["Features", "Security", "Roadmap", "Pricing"],
    Company: ["About Us", "Sustainability", "Partners", "Careers"],
    Resources: ["Documentation", "Case Studies", "Blog", "Support"],
};

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-9 aspect-square bg-indigo-500 rounded-full flex items-center justify-center">
                            <ShieldCheck size={22} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xl">Trackchain</span>
                    </div>

                    <div className="hidden md:flex items-center gap-7">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} onClick={() => document.getElementById(l.id).scrollIntoView({ behavior: 'smooth' })}
                                className="... cursor-pointer">{l.label}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => navigate("/auth")} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg transition-colors font-medium">Get Started</button>
                    </div>

                    <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="w-full md:hidden flex flex-col items-center justify-between border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} onClick={() => document.getElementById(l.id).scrollIntoView({ behavior: 'smooth' })}
                                className="... cursor-pointer">{l.label}</a>
                        ))}
                        <div className="flex-1 w-full gap-3 pt-2">
                            <button onClick={() => navigate('/auth')} className="text-sm bg-indigo-600 text-white px-5 py-3 rounded-lg w-full font-medium">Get Started</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-5 pt-12 pb-16 md:pt-16 md:pb-20">
                <div className="flex flex-col md:flex-row md:items-center md:gap-12">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full mb-5">
                            <span>Next-Gen Furniture Supply Chain</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                            Transparent Furniture{" "}
                            <span className="text-indigo-600">Supply Chain</span>{" "}
                            Powered by Blockchain
                        </h1>
                        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-lg">
                            Ensure unparalleled transparency, traceability, and authenticity for wooden furniture. Secure your assets with immutable blockchain records from forest to floor.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">

                            <button
                                onClick={() => navigate('/auth')}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
                            >
                                Get Started Now
                            </button>

                            <button
                                onClick={() => navigate('/verify')}
                                className="flex items-center justify-center gap-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 px-6 py-3 rounded-lg font-medium text-sm transition-all"
                            >
                                <QrCode size={15} />
                                Verify Product
                            </button>

                            <button
                                onClick={() =>
                                    document.getElementById('workflow')
                                        .scrollIntoView({ behavior: 'smooth' })
                                }
                                className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
                            >
                                <Play size={14} />
                                View Demo
                            </button>

                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            <div className="flex -space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-indigo-600">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-gray-500"><strong className="text-gray-800">500+</strong> Enterprises already trust TrackChain</span>
                        </div>
                    </div>

                    <div className="flex-1 mt-10 md:mt-0 flex items-center justify-center">
                        <div className="w-full max-w-sm aspect-square bg-linear-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 overflow-hidden flex items-center justify-center">
                            <img
                                src="/supplyChain.svg"
                                alt="Product"
                                className="w-full h-full object-fit"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-gray-50 py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="text-center mb-12">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Core Features</span>
                        <h2 className="text-3xl font-bold mt-4 mb-3">The Future of Traceability</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Our platform provides a comprehensive suite of tools designed to ensure every piece of furniture has a verifiable digital history.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:border-indigo-100 hover:shadow-sm transition-all">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supply Chain Flow */}
            <section id="workflow" className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="text-center mb-12">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Transparency Flow</span>
                        <h2 className="text-3xl font-bold mt-4 mb-3">From Forest to Floor</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Follow the journey of your wooden furniture as it moves through each blockchain-verified checkpoint in our global supply network.</p>
                    </div>

                    {/* Desktop horizontal */}
                    <div className="hidden md:block">
                        <div className="border border-gray-100 rounded-2xl p-8">
                            <div className="flex items-start gap-0">
                                {CHAIN.map((step, i) => (
                                    <div key={step.role} className="flex-1 flex flex-col items-center text-center relative">
                                        {i < CHAIN.length - 1 && (
                                            <div className="absolute top-5 left-1/2 w-full h-px bg-gray-200 z-0" />
                                        )}
                                        <div className="relative z-10 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border-2 border-white ring-1 ring-indigo-100">
                                            {step.icon}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 mt-3 mb-1">{step.role}</p>
                                        <p className="text-[11px] text-gray-400 leading-relaxed px-2">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-8">
                                {[
                                    { icon: <ShieldCheck size={13} />, label: "Immutable Storage" },
                                    { icon: <Lock size={13} />, label: "End-to-End Encryption" },
                                    { icon: <Globe size={13} />, label: "Public Audit Logs" },
                                    { icon: <Cpu size={13} />, label: "Automated Smart Contracts" },
                                ].map(b => (
                                    <div key={b.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                        <span className="text-indigo-400">{b.icon}</span>
                                        {b.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile vertical */}
                    <div className="md:hidden space-y-0">
                        {CHAIN.map((step, i) => (
                            <div key={step.role} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                        {step.icon}
                                    </div>
                                    {i < CHAIN.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                                </div>
                                <div className="pb-6">
                                    <p className="text-xs font-semibold text-gray-800 mb-0.5">{step.role}</p>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-y border-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {STATS.map(s => (
                            <div key={s.label}>
                                <div className="text-3xl font-bold text-gray-900">{s.num}</div>
                                <div className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section id="about" className="py-16 md:py-20">
                <div className="max-w-3xl mx-auto px-5 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-6">
                        <Leaf size={22} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Restoring Trust in Wood</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        At TrackChain, we believe sustainability starts with visibility. Our mission is to eliminate illegal logging and counterfeiting by providing the industry with the tools for total transparency.
                    </p>

                    <div className="text-left space-y-4 mt-8 mb-10">
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The wooden furniture industry has long struggled with opaque supply chains, making it difficult to verify the true origin of materials. This lack of transparency has inadvertently supported illegal deforestation and the production of low-quality counterfeit goods that damage both brands and the environment.
                        </p>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            TrackChain leverages the power of private and public blockchain protocols to create a digital fingerprint for every piece of timber. By digitizing timber certificates and automating verification through smart contracts, we empower businesses to prove their sustainability claims and provide consumers with the peace of mind they deserve.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                        {TRUST_STATS.map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{s.num}</div>
                                <div className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <button className="flex items-center gap-2 text-indigo-600 text-sm font-medium mx-auto hover:gap-3 transition-all">
                        Read Our Sustainability Report <ChevronRight size={15} />
                    </button>
                </div>
            </section>

            {/* CTA Banner */}
            <section id="contact" className="py-8 px-5">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-indigo-600 rounded-2xl p-10 md:p-14 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Ready to Secure Your Furniture Supply Chain?
                        </h2>
                        <p className="text-indigo-200 text-sm mb-8 max-w-md mx-auto">
                            Join the growing list of premium furniture brands ensuring authenticity and ethical sourcing through TrackChain.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => navigate('/contact')} className="px-6 py-2.5 bg-white text-indigo-600 font-medium text-sm rounded-lg hover:bg-indigo-50 transition-colors">
                                Contact Now
                            </button>
                            <button onClick={() => navigate('/auth')} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm rounded-lg border border-indigo-400 transition-colors">
                                Register Free Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12 mt-8">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                                    <ShieldCheck size={14} className="text-white" />
                                </div>
                                <span className="font-semibold text-gray-900 text-[15px]">TrackChain</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed max-w-[180px]">
                                Revolutionizing the wooden furniture industry through blockchain-powered transparency and immutable records.
                            </p>
                            <div className="flex gap-3 mt-4">
                                {["twitter", "github", "linkedin"].map(s => (
                                    <div key={s} className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400 font-bold">{s[0].toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                            <div key={group}>
                                <p className="text-xs font-semibold text-gray-800 mb-3">{group}</p>
                                <ul className="space-y-2">
                                    {links.map(l => (
                                        <li key={l}>
                                            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">{l}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">© 2025 TrackChain. All rights reserved.</p>
                        <div className="flex gap-4">
                            {["Privacy Policy", "Terms of Service", "Cookies"].map(l => (
                                <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{l}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}