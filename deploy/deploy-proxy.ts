import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Proxy contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const factoryArtifact = await deployer.loadArtifact("DeployFactory");
  const proxyArtifact = await deployer.loadArtifact("Proxy");

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(factoryArtifact, []);

  // ⚠️ OPTIONAL: You can skip this block if your account already has funds in L2
  // Deposit funds to L2
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee.mul(2),
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  // `greeting` is an argument for contract constructor.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const factoryContract = await deployer.deploy(factoryArtifact, []);

  //obtain the Constructor Arguments
  console.log(
    "Constructor args:" + factoryContract.interface.encodeDeploy([])
  );

  // Show the contract info.
  const factoryContractAddress = factoryContract.address;
  console.log(`${factoryArtifact.contractName} was deployed to ${factoryContractAddress}`);

  const proxyContractAddress = await factoryContract.proxy();
  console.log(`${proxyArtifact.contractName} was deployed to ${proxyContractAddress}`);

  // verify contract for tesnet & mainnet
  if (process.env.NODE_ENV != "test") {
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const factoryFullyQualifedName = "contracts/DeployFactory.sol:DeployFactory";

    // Verify contract programmatically
    await hre.run("verify:verify", {
      address: factoryContractAddress,
      contract: factoryFullyQualifedName,
      constructorArguments: [],
      bytecode: factoryArtifact.bytecode,
    });

    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const proxyFullyQualifedName = "contracts/Proxy.sol:Proxy";

    // Verify contract programmatically
    await hre.run("verify:verify", {
      address: proxyContractAddress,
      contract: proxyFullyQualifedName,
      constructorArguments: [100],
      bytecode: proxyArtifact.bytecode,
    });
  } else {
    console.log(`Contract not verified, deployed locally.`);
  }
}
