import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Mail, Clock, Lock, User, Briefcase,
    ArrowRight, ArrowLeft, Building2, MessageSquare, Check
} from "lucide-react";

export default function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        company: "", role: "", message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7] font-sans text-gray-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">Trackchain</span>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-white border-b border-gray-100 py-12 px-5">
                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full mb-5 uppercase tracking-widest">
                        Contact Now
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                        Let's talk about your supply chain
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Tell us about your business and we'll help you find the right Trackchain plan.
                        Our team typically responds within one business day.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-[1fr_1.7fr] gap-6">

                {/* Left: Info Cards */}
                <div className="flex flex-col gap-4">

                    {[
                        {
                            icon: <Mail size={18} />,
                            title: "Email us",
                            sub: "Reach our sales team directly.",
                            value: "sales@trackchain.io",
                        },
                        {
                            icon: <Clock size={18} />,
                            title: "Response time",
                            sub: "We're quick to respond.",
                            value: "Within 1 business day",
                        },
                        {
                            icon: <ShieldCheck size={18} />,
                            title: "Enterprise ready",
                            sub: "Custom contracts, SLAs, and dedicated onboarding for large teams.",
                            value: null,
                        },
                    ].map((card) => (
                        <div key={card.title} className="bg-white border border-gray-100 rounded-2xl p-5">
                            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                                {card.icon}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">{card.title}</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{card.sub}</p>
                            {card.value && (
                                <p className="text-xs text-indigo-500 font-medium mt-2">{card.value}</p>
                            )}
                        </div>
                    ))}

                    {/* Trust box */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                        <p className="text-xs font-semibold text-indigo-700 mb-3">Trusted by 500+ companies</p>
                        <div className="flex flex-col gap-2">
                            {[
                                "Immutable blockchain records",
                                "End-to-end encryption",
                                "Role-based access control",
                            ].map((f) => (
                                <div key={f} className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                        <Check size={10} className="text-indigo-600" />
                                    </div>
                                    <span className="text-xs text-indigo-600">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8">

                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16">
                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <Check size={28} className="text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
                            <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                                Thanks for reaching out. Our sales team will get back to you within one business day.
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:gap-3 transition-all"
                            >
                                Back to Home <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Send us a message</h2>
                            <p className="text-xs text-gray-400 mb-6">Fill out the form and our team will be in touch.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: "First Name", name: "firstName", placeholder: "John", icon: <User size={14} /> },
                                        { label: "Last Name", name: "lastName", placeholder: "Smith", icon: <User size={14} /> },
                                    ].map((f) => (
                                        <div key={f.name}>
                                            <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                                {f.label}
                                            </label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-3 text-gray-300">{f.icon}</span>
                                                <input
                                                    type="text"
                                                    name={f.name}
                                                    value={formData[f.name]}
                                                    onChange={handleChange}
                                                    placeholder={f.placeholder}
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        Work Email
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@company.com"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        Company
                                    </label>
                                    <div className="relative flex items-center">
                                        <Building2 size={14} className="absolute left-3 text-gray-300" />
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Acme Corp"
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        Your Role
                                    </label>
                                    <div className="relative flex items-center">
                                        <Briefcase size={14} className="absolute left-3 text-gray-300" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none bg-white"
                                        >
                                            <option value="">Select your role</option>
                                            <option value="supplier">Supplier</option>
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="distributor">Distributor</option>
                                            <option value="retailer">Retailer</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                                        Message
                                    </label>
                                    <div className="relative">
                                        <MessageSquare size={14} className="absolute left-3 top-3 text-gray-300" />
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Tell us about your supply chain needs..."
                                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    Send Message
                                    <ArrowRight size={15} />
                                </button>
                            </form>

                            {/* Trust badges */}
                            <div className="flex justify-center gap-6 mt-6 pt-5 border-t border-gray-100">
                                {[
                                    { icon: <ShieldCheck size={13} />, label: "Blockchain secured" },
                                    { icon: <Lock size={13} />, label: "End-to-end encrypted" },
                                    { icon: <User size={13} />, label: "Role-based access" },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-1.5 text-gray-400">
                                        {s.icon}
                                        <span className="text-[12px]">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 py-5 text-center">
                <p className="text-xs text-gray-400">© 2025 Trackchain. All rights reserved.</p>
            </div>
        </div>
    );
}