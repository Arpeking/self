import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { RegisterVerifierId, DscVerifierId } from "@selfxyz/common";

dotenv.config();

// Define AttestationId constants directly based on values from AttestationId.sol
const AttestationId = {
  // Pad with zeros to create full 32 bytes length
  E_PASSPORT: "0x0000000000000000000000000000000000000000000000000000000000000001",
  EU_ID_CARD: "0x0000000000000000000000000000000000000000000000000000000000000002",
};

// Debug logs for paths and files
console.log("Current directory:", __dirname);
console.log(
  "Deployed addresses path:",
  path.join(__dirname, "../ignition/deployments/staging/deployed_addresses.json"),
);
console.log(
  "Contract ABI path:",
  path.join(__dirname, "../ignition/deployments/staging/artifacts/DeployV2#IdentityVerificationHubImplV2.json"),
);

// Debug logs for environment variables (redacted for security)
console.log("CELO_RPC_URL configured:", !!process.env.CELO_ALFAJORES_RPC_URL);
console.log("CELO_KEY configured:", !!process.env.PRIVATE_KEY);

try {
  const deployedAddresses = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../ignition/deployments/staging/deployed_addresses.json"), "utf-8"),
  );
  console.log("Deployed addresses loaded:", deployedAddresses);

  const identityVerificationHubAbiFile = fs.readFileSync(
    path.join(__dirname, "../ignition/deployments/staging/artifacts/DeployV2#IdentityVerificationHubImplV2.json"),
    "utf-8",
  );
  console.log("ABI file loaded");

  const identityVerificationHubAbi = JSON.parse(identityVerificationHubAbiFile).abi;
  console.log("ABI parsed");

  function getContractAddressByPartialName(partialName: string): string | unknown {
    for (const [key, value] of Object.entries(deployedAddresses)) {
      if (key.includes(partialName)) {
        return value;
      }
    }
    return undefined;
  }

  function getContractAddressByExactName(exactName: string): string | unknown {
    if (exactName in deployedAddresses) {
      return deployedAddresses[exactName];
    }
    return undefined;
  }

  function getAttestationIdBytes32(attestationIdName: string): string {
    return AttestationId[attestationIdName as keyof typeof AttestationId];
  }

  async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.CELO_ALFAJORES_RPC_URL as string);
    console.log("Provider created");

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
    console.log("Wallet created");

    // const hubAddress = deployedAddresses["DeployHub#IdentityVerificationHub"];
    const hubAddress = "0xbaB9B3c376e84FEB4aFD9423e3aB278B47d34a0a"; // Update with your actual hub address
    console.log("Hub address:", hubAddress);

    if (!hubAddress) {
      throw new Error("Hub address not found in deployed_addresses.json");
    }

    const identityVerificationHub = new ethers.Contract(hubAddress, identityVerificationHubAbi, wallet);
    console.log("Contract instance created");

    // Update registry addresses for different attestation types
    const attestationTypes = ["E_PASSPORT", "EU_ID_CARD"];
    for (const attestationType of attestationTypes) {
      let registryName: any;
      if (attestationType == "E_PASSPORT") {
        registryName = "DeployRegistryModule#IdentityRegistry";
      } else if (attestationType == "EU_ID_CARD") {
        registryName = "DeployIdCardRegistryModule#IdentityRegistryIdCard";
      }

      const registryAddress = getContractAddressByExactName(registryName);
      console.log("Registry address:", registryAddress);

      if (!registryAddress) {
        console.log(`Skipping registry update for ${attestationType} because no deployed address was found.`);
        continue;
      }

      console.log(`Updating registry for ${attestationType}`);
      const attestationId = getAttestationIdBytes32(attestationType);

      try {
        const tx = await identityVerificationHub.updateRegistry(attestationId, registryAddress);
        const receipt = await tx.wait();
        console.log(`Registry for ${attestationType} updated with tx: ${receipt.hash}`);
      } catch (error) {
        console.error(`Error updating registry for ${attestationType}:`, error);
      }
    }

    // Update VC and Disclose circuit verifiers for different attestation types
    for (const attestationType of attestationTypes) {
      let verifierName: any;
      if (attestationType == "E_PASSPORT") {
        verifierName = "DeployAllVerifiers#Verifier_vc_and_disclose";
      } else if (attestationType == "EU_ID_CARD") {
        verifierName = "";
      }
      const verifierAddress = getContractAddressByExactName(verifierName);

      if (!verifierAddress) {
        console.log(
          `Skipping VC and Disclose circuit update for ${attestationType} because no deployed address was found.`,
        );
        continue;
      }

      console.log(`Updating VC and Disclose circuit for ${attestationType}`);
      const attestationId = getAttestationIdBytes32(attestationType);

      try {
        const tx = await identityVerificationHub.updateVcAndDiscloseCircuit(attestationId, verifierAddress);
        const receipt = await tx.wait();
        console.log(`VC and Disclose circuit for ${attestationType} updated with tx: ${receipt.hash}`);
      } catch (error) {
        console.error(`Error updating VC and Disclose circuit for ${attestationType}:`, error);
      }
    }

    // Batch update register circuit verifiers
    const registerVerifierKeys = Object.keys(RegisterVerifierId).filter((key) => isNaN(Number(key)));
    const registerCircuitVerifierIds: number[] = [];
    const registerCircuitVerifierAddresses: string[] = [];

    for (const key of registerVerifierKeys) {
      const verifierName = `Verifier_${key}`;
      const verifierAddress = getContractAddressByPartialName(verifierName);

      if (!verifierAddress) {
        console.log(`Skipping ${verifierName} because no deployed address was found.`);
        continue;
      }

      const verifierId = RegisterVerifierId[key as keyof typeof RegisterVerifierId];
      registerCircuitVerifierIds.push(verifierId);
      registerCircuitVerifierAddresses.push(verifierAddress as string);
    }

    if (registerCircuitVerifierIds.length > 0) {
      console.log("Batch updating register circuit verifiers");

      try {
        const tx = await identityVerificationHub.batchUpdateRegisterCircuitVerifiers(
          registerCircuitVerifierIds,
          registerCircuitVerifierAddresses,
        );
        const receipt = await tx.wait();
        console.log(`Register circuit verifiers updated with tx: ${receipt.hash}`);
      } catch (error) {
        console.error("Error batch updating register circuit verifiers:", error);
      }
    }

    // Batch update DSC circuit verifiers
    const dscKeys = Object.keys(DscVerifierId).filter((key) => isNaN(Number(key)));
    const dscCircuitVerifierIds: number[] = [];
    const dscCircuitVerifierAddresses: string[] = [];

    for (const key of dscKeys) {
      const verifierName = `Verifier_${key}`;
      const verifierAddress = getContractAddressByPartialName(verifierName);

      if (!verifierAddress) {
        console.log(`Skipping ${verifierName} because no deployed address was found.`);
        continue;
      }

      const verifierId = DscVerifierId[key as keyof typeof DscVerifierId];
      dscCircuitVerifierIds.push(verifierId);
      dscCircuitVerifierAddresses.push(verifierAddress as string);
    }

    if (dscCircuitVerifierIds.length > 0) {
      console.log("Batch updating DSC circuit verifiers");

      try {
        const tx = await identityVerificationHub.batchUpdateDscCircuitVerifiers(
          dscCircuitVerifierIds,
          dscCircuitVerifierAddresses,
        );
        const receipt = await tx.wait();
        console.log(`DSC circuit verifiers updated with tx: ${receipt.hash}`);
      } catch (error) {
        console.error("Error batch updating DSC circuit verifiers:", error);
      }
    }
  }

  main().catch((error) => {
    console.error("Execution error:", error);
    process.exitCode = 1;
  });
} catch (error) {
  console.error("Initial setup error:", error);
  process.exitCode = 1;
}
