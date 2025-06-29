import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the ChainlinkHypothesisValidator contract using the deployer account.
 */
const deployChainlinkValidator: DeployFunction = async function (hre) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("Deploying ChainlinkHypothesisValidator...");
  console.log("Deployer:", deployer);

  // Get the deployed mock VRF coordinator address
  const mockVrfCoordinator = await get("MockVRFCoordinatorV2");
  const subscriptionId = 1; // Mock subscription ID
  const gasLane = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"; // Mock gas lane
  const callbackGasLimit = 500000;

  const result = await deploy("ChainlinkHypothesisValidator", {
    from: deployer,
    args: [mockVrfCoordinator.address, subscriptionId, gasLane, callbackGasLimit],
    log: true,
    autoMine: true,
  });

  console.log("ChainlinkHypothesisValidator deployed to:", result.address);
};

export default deployChainlinkValidator;

deployChainlinkValidator.tags = ["ChainlinkHypothesisValidator"];
deployChainlinkValidator.dependencies = ["MockVRF", "Hypo"]; // Deploy after MockVRF and Hypo contracts 