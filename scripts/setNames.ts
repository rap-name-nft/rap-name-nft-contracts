// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import {rapNames} from "../rapNames";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
  const rapNameNFT = await RapNameNFT.attach('0xD2aaac867835A2a5dEA574c043DcB2E3C5fbCfC6');
  await rapNameNFT.setRapNames(rapNames);
  await rapNameNFT.ownerClaim();

  console.log("RapNameNFT deployed to:", rapNameNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
