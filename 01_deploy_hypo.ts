import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Hypo contract using the deployer account.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployHypo: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Hypo", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const hypo = await hre.ethers.getContract<Contract>("Hypo", deployer);
};

export default deployHypo;

deployHypo.tags = ["Hypo"]; 