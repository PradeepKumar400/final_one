import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Database config — matched with your application.properties ──
const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "pradeep",
  database: "testdb"
};

async function getWalletAddresses() {
  const connection = await mysql.createConnection(DB_CONFIG);

  const [presidents] = await connection.execute(
    `SELECT username, wallet_address 
     FROM users 
     WHERE role = 'PRESIDENT' AND wallet_address IS NOT NULL`
  );

  const [wardMembers] = await connection.execute(
    `SELECT username, wallet_address 
     FROM users 
     WHERE role = 'WARD_MEMBER' AND wallet_address IS NOT NULL`
  );

  await connection.end();
  return { presidents, wardMembers };
}

async function main() {
  console.log("Connecting to local Hardhat node...");
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  console.log("Loading compiled contract...");
  const contractPath = path.resolve(
    __dirname, "..", "artifacts", "contracts",
    "GramaNiti.sol", "GramaNiti.json"
  );
  const contractData = JSON.parse(fs.readFileSync(contractPath, "utf-8"));

  console.log("Deploying GramaNiti Smart Contract...");
  const factory = new ethers.ContractFactory(
    contractData.abi, contractData.bytecode, signer
  );
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`\n✅ GramaNiti deployed successfully to: ${address}`);

  // ── Fetch addresses from database ──
  console.log("\nFetching wallet addresses from database...");
  const { presidents, wardMembers } = await getWalletAddresses();

  if (presidents.length === 0) {
    console.log("⚠️  No president wallet found in database.");
  }

  if (wardMembers.length === 0) {
    console.log("⚠️  No ward member wallets found in database.");
  }

  // ── Register roles on blockchain ──
  console.log("\nRegistering roles on blockchain...");
  
  // Register presidents
  for (const p of presidents) {
    const tx = await contract.registerPresident(p.wallet_address);
    await tx.wait();
    console.log(`✅ President registered: ${p.username} → ${p.wallet_address}`);
  }

  // Register ward members
  for (const w of wardMembers) {
    const tx = await contract.registerWardMember(w.wallet_address);
    await tx.wait();
    console.log(`✅ Ward member registered: ${w.username} → ${w.wallet_address}`);
  }

  // ── Verify ──
  console.log("\n── Verification ──");
  for (const p of presidents) {
    const ok = await contract.isPresident(p.wallet_address);
    console.log(`${p.username} (${p.wallet_address}) is president?`, ok);
  }
  for (const w of wardMembers) {
    const ok = await contract.isWardMember(w.wallet_address);
    console.log(`${w.username} (${w.wallet_address}) is ward member?`, ok);
  }

  console.log("\n✅ CONTRACT ADDRESS TO COPY INTO web3Config.js:");
  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
