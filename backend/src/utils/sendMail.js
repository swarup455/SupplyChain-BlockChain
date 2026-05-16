// utils/sendMail.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,     // your gmail
        pass: process.env.MAIL_PASS,     // app password (not gmail password)
    },
});

export const sendMail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"Trackchain" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    });
};

// utils/sendMail.js

export const sendCredentialsMail = async ({ name, email, userId, password, role }) => {

    const ROLE_META = {
        supplier: { label: "Supplier", color: "#f97316", icon: "📦" },
        manufacturer: { label: "Manufacturer", color: "#3b82f6", icon: "🏭" },
        distributor: { label: "Distributor", color: "#8b5cf6", icon: "🚚" },
        retailer: { label: "Retailer", color: "#10b981", icon: "🏪" },
    };

    const meta = ROLE_META[role] || { label: role, color: "#6366f1", icon: "👤" };

    await sendMail({
        to: email,
        subject: `🔐 Your Trackchain Account Credentials — ${meta.label}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;margin:0;padding:0}
                .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10)}
                .head{background:linear-gradient(135deg,#1e1b4b,#4338ca);padding:44px 40px;text-align:center}
                .head h1{color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px}
                .badge{display:inline-block;background:${meta.color};color:#fff;padding:7px 22px;border-radius:100px;font-size:12px;font-weight:700;margin-top:16px;letter-spacing:1px}
                .body{padding:40px}
                .hi{font-size:16px;font-weight:700;color:#1e293b;margin-bottom:12px}
                .txt{font-size:14px;color:#475569;line-height:1.8;margin-bottom:20px}
                .cred-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin:24px 0}
                .cred-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9}
                .cred-row:last-child{border-bottom:none}
                .cred-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8}
                .cred-value{font-size:14px;font-weight:700;color:#1e293b;font-family:monospace;background:#fff;border:1px solid #e2e8f0;padding:6px 14px;border-radius:8px}
                .warn{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;font-size:12px;color:#92400e;margin-top:8px}
                .foot{background:#f8fafc;padding:22px 40px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}
            </style>
        </head>
        <body>
            <div class="wrap">
                <div class="head">
                    <h1>🔗 Trackchain</h1>
                    <div class="badge">${meta.icon} ${meta.label.toUpperCase()} ACCOUNT</div>
                </div>
                <div class="body">
                    <div class="hi">Hello, ${name}!</div>
                    <div class="txt">
                        Your Trackchain account has been created by the admin. 
                        Use the credentials below to log in to your dashboard.
                    </div>

                    <div class="cred-box">
                        <div class="cred-row">
                            <span class="cred-label">User ID</span>
                            <span class="cred-value">${userId}</span>
                        </div>
                        <div class="cred-row">
                            <span class="cred-label">Password</span>
                            <span class="cred-value">${password}</span>
                        </div>
                        <div class="cred-row">
                            <span class="cred-label">Role</span>
                            <span class="cred-value">${meta.label}</span>
                        </div>
                        <div class="cred-row">
                            <span class="cred-label">Login URL</span>
                            <span class="cred-value">${process.env.CLIENT_URL}/auth</span>
                        </div>
                    </div>

                    <div class="warn">
                        ⚠️ Please change your password after your first login. 
                        Do not share these credentials with anyone.
                    </div>
                </div>
                <div class="foot">
                    <strong>Trackchain Admin</strong> · ${process.env.MAIL_USER}<br>
                    © ${new Date().getFullYear()} Trackchain. All rights reserved.
                </div>
            </div>
        </body>
        </html>`,
    });
};