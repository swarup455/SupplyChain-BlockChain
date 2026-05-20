import hre from "hardhat";

async function main() {
  const [admin, supplier, manufacturer, distributor, retailer] =
    await hre.ethers.getSigners();

  const Contract = await hre.ethers.getContractFactory("FurnitureSupplyChain");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);

  // Assign roles (0=Supplier, 1=Manufacturer, 2=Distributor, 3=Retailer, 4=Customer)
  await contract.assignRole(supplier.address, 0);
  await contract.assignRole(manufacturer.address, 1);
  await contract.assignRole(distributor.address, 2);
  await contract.assignRole(retailer.address, 3);

  console.log("Roles assigned to:", {
    supplier: supplier.address,
    manufacturer: manufacturer.address,
    distributor: distributor.address,
    retailer: retailer.address
  });
}

main().catch(console.error);