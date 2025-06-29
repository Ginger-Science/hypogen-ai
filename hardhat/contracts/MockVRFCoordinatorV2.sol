// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title MockVRFCoordinatorV2
 * @dev Mock implementation of Chainlink VRF Coordinator for local development
 */
contract MockVRFCoordinatorV2 is VRFCoordinatorV2Interface {
    
    mapping(uint64 => address) public s_subscriptions;
    mapping(bytes32 => uint256[]) public s_randomWords;
    
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external override returns (uint256 requestId) {
        require(s_subscriptions[subId] != address(0), "Invalid subscription");
        
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, keyHash)));
        
        // Generate mock random words
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint32 i = 0; i < numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encodePacked(requestId, i)));
        }
        
        s_randomWords[bytes32(requestId)] = randomWords;
        
        emit RandomWordsRequested(
            keyHash,
            requestId,
            0,
            subId,
            requestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );
        
        return requestId;
    }

    function createSubscription() external override returns (uint64 subId) {
        subId = uint64(block.timestamp);
        s_subscriptions[subId] = msg.sender;
        return subId;
    }

    function getSubscription(uint64 subId) external view override returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        require(s_subscriptions[subId] != address(0), "Invalid subscription");
        return (0, 0, s_subscriptions[subId], new address[](0));
    }

    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external override {}
    function acceptSubscriptionOwnerTransfer(uint64 subId) external override {}
    function addConsumer(uint64 subId, address consumer) external override {}
    function removeConsumer(uint64 subId, address consumer) external override {}
    function cancelSubscription(uint64 subId, address to) external override {}
    function pendingRequestExists(uint64 subId) external view override returns (bool) { return false; }

    function getRequestConfig() external view override returns (uint16, uint32, bytes32[] memory) {
        return (0, 0, new bytes32[](0));
    }
} 