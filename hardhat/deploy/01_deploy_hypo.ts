import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the Hypo contract using the deployer account.
 */
const deployHypo: DeployFunction = async function (hre) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying Hypo contract...");
  console.log("Deployer:", deployer);

  const result = await deploy("Hypo", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("Hypo deployed to:", result.address);
};

export default deployHypo;

deployHypo.tags = ["Hypo"]; 