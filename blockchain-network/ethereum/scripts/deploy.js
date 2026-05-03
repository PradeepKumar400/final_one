import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Connecting to local Hardhat node...");
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Use Account #0 from the hardhat node
  const signer = await provider.getSigner();
  
  console.log("Loading compiled contract...");
  const contractPath = path.resolve(__dirname, "..", "artifacts", "contracts", "GramaNiti.sol", "GramaNiti.json");
  const contractData = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
  
  console.log("Deploying GramaNiti Smart Contract...");
  const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);
  const contract = await factory.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`\n✅ GramaNiti deployed successfully to: ${address}`);
  console.log(`\nNext Step: Copy the above address and paste it into:`);
  console.log(`SmartPanchanyat/src/utils/web3Config.js -> CONTRACT_ADDRESS`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
