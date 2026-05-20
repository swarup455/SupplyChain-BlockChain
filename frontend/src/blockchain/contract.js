import { ethers } from "ethers";
import { getSigner } from "./provider";
import { CONTRACT_ADDRESS, ABI } from "./config";

async function getContract() {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function assignRole(walletAddress, roleNumber) {
    const contract = await getContract();
    const tx = await contract.assignRole(walletAddress, roleNumber);
    await tx.wait(); // wait for block confirmation
    return tx.hash;
}

// ─── SUPPLIER ────────────────────────────────────────────

export async function registerProduct(productID, timberBatchID, notes) {
    const contract = await getContract();
    const tx = await contract.registerProduct(productID, timberBatchID, notes);
    await tx.wait();
    return tx.hash;
}

export async function transferOwnership(productID, nextOwnerWallet, notes) {
    const contract = await getContract();
    const tx = await contract.transferOwnership(productID, nextOwnerWallet, notes);
    await tx.wait();
    return tx.hash;
}

export async function getProduct(productID) {
    const contract = await getContract();
    const product = await contract.getProduct(productID);
    return {
        productID: product.productID,
        timberBatchID: product.timberBatchID,
        currentOwner: product.currentOwner,
        stage: Number(product.stage),
        timestamp: Number(product.timestamp),
        exists: product.exists,
        timberUsed: product.timberUsed,    // ← ADD THIS
    };
}

// Get full history of a product (for customer verification)
export async function getProductHistory(productID) {
    const contract = await getContract();
    const history = await contract.getProductHistory(productID);

    // Map stage numbers to readable labels
    const stageLabels = [
        "Timber Registered",    // 0
        "Manufacturing Done",   // 1
        "Dispatched",           // 2
        "Retail Received",      // 3
        "Customer Verified",    // 4
    ];

    return history.map((entry) => ({
        actor: entry.actor,
        stage: stageLabels[Number(entry.stage)],
        timestamp: new Date(Number(entry.timestamp) * 1000).toLocaleString(),
        notes: entry.notes,
    }));
}

// ─── MANUFACTURER ─────────────────────────────────────────

export async function createFinishedProduct(newProductID, sourceTimberID, notes) {
    const contract = await getContract();
    const tx = await contract.createFinishedProduct(newProductID, sourceTimberID, notes);
    await tx.wait();
    return tx.hash;
}

// Get role of any wallet address
export async function getRole(walletAddress) {
    const contract = await getContract();
    const roleNumber = await contract.roles(walletAddress);
    const roleLabels = [
        "Supplier",
        "Manufacturer",
        "Distributor",
        "Retailer",
        "Customer",
    ];
    return roleLabels[Number(roleNumber)];
}

// Check if wallet is registered
export async function isRegistered(walletAddress) {
    const contract = await getContract();
    return await contract.isRegistered(walletAddress);
}