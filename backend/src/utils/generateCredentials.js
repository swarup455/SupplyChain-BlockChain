// utils/generateCredentials.js

export const generateCredentials = (fullName, role) => {

    const ROLE_PREFIX = {
        supplier: "SUP",
        manufacturer: "MFG",
        distributor: "DIST",
        retailer: "RET",
    };

    const namePart = fullName
        .replace(/[^a-zA-Z\s]/g, "")
        .trim()
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 3)
        .padEnd(2, "X");

    const suffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = ROLE_PREFIX[role] || "STK";

    const userId = `${prefix}-${namePart}${suffix}`;
    const password = `${prefix.charAt(0)}${prefix.slice(1).toLowerCase()}@${Math.floor(100000 + Math.random() * 900000)}`;

    return { userId, password };
};