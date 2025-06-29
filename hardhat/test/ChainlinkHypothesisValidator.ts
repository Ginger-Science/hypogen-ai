import { ethers } from "hardhat";
import { expect } from "chai";
const hre = require("hardhat");

describe("ChainlinkHypothesisValidator", function () {
  let validator: any;
  let deployer: string;

  beforeEach(async () => {
    await hre.deployments.fixture(["MockVRF", "Hypo", "ChainlinkHypothesisValidator"]);
    const accounts = await hre.getNamedAccounts();
    deployer = accounts.deployer;
    const Validator = await ethers.getContract("ChainlinkHypothesisValidator");
    validator = Validator.connect(await ethers.getSigner(deployer));
  });

  it("should allow submitting, validating, and badge requesting for a hypothesis", async function () {
    // 1. Submit a hypothesis
    const content = "The mitochondria is the powerhouse of the cell.";
    const metadata = "ipfs://testhash";
    const tx = await validator.submitHypothesis(content, metadata);
    await tx.wait();

    // 2. Get the user's hypotheses
    const userHypotheses = await validator.getResearcherHypotheses(deployer);
    expect(userHypotheses.length).to.be.greaterThan(0);

    const hypothesisId = userHypotheses[0];
    const hypothesis = await validator.getHypothesis(hypothesisId);

    // 3. Check validation (should be validated automatically by performUpkeep)
    // We'll call performUpkeep manually to simulate Chainlink Automation
    const performData = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [hypothesisId]);
    await validator.performUpkeep(performData);

    const validated = await validator.getHypothesis(hypothesisId);
    expect(validated.isValidated).to.be.true;
    expect(validated.validationScore).to.be.greaterThan(0);

    // 4. Request a badge (should succeed if score >= 75)
    if (validated.validationScore >= 75) {
      const badgeTx = await validator.requestBadgeAssignment(hypothesisId);
      await badgeTx.wait();
      // No revert = success
    }
  });
}); 