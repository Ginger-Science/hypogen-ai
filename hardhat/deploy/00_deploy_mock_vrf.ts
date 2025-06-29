import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the MockVRFCoordinatorV2 contract for local development.
 */
const deployMockVRF: DeployFunction = async function (hre) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying MockVRFCoordinatorV2...");
  console.log("Deployer:", deployer);

  const result = await deploy("MockVRFCoordinatorV2", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("MockVRFCoordinatorV2 deployed to:", result.address);
};

export default deployMockVRF;

deployMockVRF.tags = ["MockVRF"]; 