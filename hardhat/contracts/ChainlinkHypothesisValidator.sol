// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainlinkHypothesisValidator
 * @dev A contract that validates research hypotheses using Chainlink services
 * - Chainlink Functions for AI validation
 * - Chainlink VRF for random badge assignment
 * - Chainlink Automation for periodic validation checks
 */
contract ChainlinkHypothesisValidator is AutomationCompatible, VRFConsumerBaseV2, ConfirmedOwner {
    
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Hypothesis validation state
    struct Hypothesis {
        string content;
        string metadata;
        address researcher;
        uint256 timestamp;
        bool isValidated;
        uint256 validationScore;
        string validationResult;
    }

    // Events
    event HypothesisSubmitted(uint256 indexed hypothesisId, address indexed researcher, string content);
    event HypothesisValidated(uint256 indexed hypothesisId, uint256 score, string result);
    event BadgeAwarded(uint256 indexed hypothesisId, address indexed researcher, string badgeType);
    event ValidationRequested(uint256 indexed hypothesisId, bytes32 requestId);

    // State variables
    mapping(uint256 => Hypothesis) public hypotheses;
    mapping(uint256 => uint256) public requestIdToHypothesisId;
    mapping(address => uint256[]) public researcherHypotheses;
    
    uint256 public hypothesisCounter;
    uint256 public validationThreshold = 75; // Minimum score for validation (0-100)
    
    // Badge types
    string[] public badgeTypes = ["Innovation", "Rigor", "Impact", "Novelty", "Methodology"];

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ConfirmedOwner(msg.sender) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    /**
     * @dev Submit a new hypothesis for validation
     * @param content The hypothesis content
     * @param metadata Additional metadata (IPFS hash, etc.)
     */
    function submitHypothesis(string memory content, string memory metadata) external {
        require(bytes(content).length > 0, "Hypothesis content cannot be empty");
        
        hypothesisCounter++;
        uint256 hypothesisId = hypothesisCounter;
        
        hypotheses[hypothesisId] = Hypothesis({
            content: content,
            metadata: metadata,
            researcher: msg.sender,
            timestamp: block.timestamp,
            isValidated: false,
            validationScore: 0,
            validationResult: ""
        });
        
        researcherHypotheses[msg.sender].push(hypothesisId);
        
        emit HypothesisSubmitted(hypothesisId, msg.sender, content);
    }

    /**
     * @dev Request Chainlink VRF for random badge assignment
     * @param hypothesisId The hypothesis ID to award badge for
     */
    function requestBadgeAssignment(uint256 hypothesisId) external {
        require(hypotheses[hypothesisId].researcher == msg.sender, "Only researcher can request badge");
        require(hypotheses[hypothesisId].isValidated, "Hypothesis must be validated first");
        require(hypotheses[hypothesisId].validationScore >= validationThreshold, "Score too low for badge");
        
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        
        requestIdToHypothesisId[requestId] = hypothesisId;
        emit ValidationRequested(hypothesisId, bytes32(requestId));
    }

    /**
     * @dev Chainlink VRF callback function
     * @param requestId The request ID from VRF
     * @param randomWords Array of random words
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 hypothesisId = requestIdToHypothesisId[requestId];
        require(hypothesisId > 0, "Invalid request ID");
        
        uint256 randomIndex = randomWords[0] % badgeTypes.length;
        string memory badgeType = badgeTypes[randomIndex];
        
        emit BadgeAwarded(hypothesisId, hypotheses[hypothesisId].researcher, badgeType);
    }

    /**
     * @dev Chainlink Automation check function
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Data to pass to performUpkeep
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check for unvalidated hypotheses older than 1 hour
        for (uint256 i = 1; i <= hypothesisCounter; i++) {
            if (!hypotheses[i].isValidated && 
                block.timestamp - hypotheses[i].timestamp > 1 hours) {
                upkeepNeeded = true;
                performData = abi.encode(i);
                break;
            }
        }
    }

    /**
     * @dev Chainlink Automation perform function
     * @param performData Data from checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 hypothesisId = abi.decode(performData, (uint256));
        
        // Simulate AI validation (in real implementation, this would call Chainlink Functions)
        _validateHypothesis(hypothesisId);
    }

    /**
     * @dev Internal function to validate hypothesis (simulated AI validation)
     * @param hypothesisId The hypothesis ID to validate
     */
    function _validateHypothesis(uint256 hypothesisId) internal {
        Hypothesis storage hypothesis = hypotheses[hypothesisId];
        require(!hypothesis.isValidated, "Hypothesis already validated");
        
        // Simulate AI validation score (0-100)
        uint256 score = _generateValidationScore(hypothesis.content);
        
        hypothesis.validationScore = score;
        hypothesis.isValidated = true;
        hypothesis.validationResult = score >= validationThreshold ? "APPROVED" : "REJECTED";
        
        emit HypothesisValidated(hypothesisId, score, hypothesis.validationResult);
    }

    /**
     * @dev Generate a simulated validation score based on content length and complexity
     * @param content The hypothesis content
     * @return score The validation score (0-100)
     */
    function _generateValidationScore(string memory content) internal view returns (uint256 score) {
        uint256 length = bytes(content).length;
        
        // Simple scoring algorithm (in real implementation, this would be AI-powered)
        if (length < 50) {
            score = 30; // Too short
        } else if (length < 200) {
            score = 60; // Moderate
        } else if (length < 500) {
            score = 80; // Good length
        } else {
            score = 90; // Comprehensive
        }
        
        // Add some randomness to simulate AI analysis
        score += uint256(keccak256(abi.encodePacked(content, block.timestamp))) % 20;
        
        // Ensure score is within bounds
        if (score > 100) score = 100;
    }

    /**
     * @dev Get all hypotheses for a researcher
     * @param researcher The researcher address
     * @return hypothesisIds Array of hypothesis IDs
     */
    function getResearcherHypotheses(address researcher) external view returns (uint256[] memory) {
        return researcherHypotheses[researcher];
    }

    /**
     * @dev Get hypothesis details
     * @param hypothesisId The hypothesis ID
     * @return hypothesis The hypothesis struct
     */
    function getHypothesis(uint256 hypothesisId) external view returns (Hypothesis memory) {
        return hypotheses[hypothesisId];
    }

    /**
     * @dev Update validation threshold (owner only)
     * @param newThreshold The new threshold value
     */
    function setValidationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 100, "Threshold must be <= 100");
        validationThreshold = newThreshold;
    }

    /**
     * @dev Add new badge type (owner only)
     * @param badgeType The new badge type
     */
    function addBadgeType(string memory badgeType) external onlyOwner {
        badgeTypes.push(badgeType);
    }

    /**
     * @dev Get all badge types
     * @return Array of badge types
     */
    function getBadgeTypes() external view returns (string[] memory) {
        return badgeTypes;
    }
} 