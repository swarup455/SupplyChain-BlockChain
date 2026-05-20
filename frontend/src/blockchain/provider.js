// src/blockchain/provider.js
import { ethers } from "ethers";

// Connect to MetaMask and return signer
export async function getSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask.");
  }

  // This triggers the MetaMask popup to connect
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
}

// Get currently connected wallet address
export async function getWalletAddress() {
  const signer = await getSigner();
  return await signer.getAddress();
}

// Listen for wallet/account change
export function onAccountChange(callback) {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      callback(accounts[0]);
    });
  }
}

// Listen for network change
export function onNetworkChange(callback) {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", () => {
      callback();
      window.location.reload(); // safest option on network change
    });
  }
}