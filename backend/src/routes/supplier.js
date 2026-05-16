import { ethers } from "ethers";
import express from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const abiPath = path.join(__dirname, "../../../blockchain/artifacts/contracts/FurnitureSupplyChain.sol/FurnitureSupplyChain.json");
const { abi } = JSON.parse(readFileSync(abiPath, "utf8"));

const getContract = () => {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);
};

// POST /api/supplier/register
router.post("/register", async (req, res) => {
  try {
    const { batchID, supplierID, forestLocation, certificationStatus, harvestDate } = req.body;

    const contract = getContract();
    const harvestTimestamp = Math.floor(new Date(harvestDate).getTime() / 1000);

    const tx = await contract.registerTimberBatch(
      batchID, supplierID, forestLocation, certificationStatus, harvestTimestamp
    );
    await tx.wait();

    res.json({ 
      success: true, 
      txHash: tx.hash, 
      message: "Timber batch registered on blockchain" 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/supplier/batch/:batchID
router.get("/batch/:batchID", async (req, res) => {
  try {
    const contract = getContract();
    const batch = await contract.getTimberBatch(req.params.batchID);

    res.json({
      success: true,
      data: {
        batchID: batch[0],
        supplierID: batch[1],
        forestLocation: batch[2],
        certificationStatus: batch[3],
        harvestDate: new Date(Number(batch[4]) * 1000).toLocaleDateString(),
        registeredBy: batch[5],
        timestamp: new Date(Number(batch[6]) * 1000).toLocaleString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;