import { ethers } from "ethers";
import { ABI } from "../libs/abi";
import * as Database from "../libs/database";
import * as dotenv from "dotenv"
import { unpin } from "../libs/ipfs"
dotenv.config();
let isParsingBridges = false

export const contract = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS ?? "",
    ABI,
    wallet
  );
  return { contract, wallet, provider, ethers };
}
