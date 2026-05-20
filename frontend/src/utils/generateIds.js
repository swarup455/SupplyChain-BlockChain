export function generateBatchID() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000; // 4 digit random

    return `TMB-${year}${month}${day}-${random}`;
    // Output example: TMB-20260518-4821
}

export function generateProductID() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `FP-${year}${month}${day}-${random}`;
}
