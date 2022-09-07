// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NftStorageBridge
 */
contract NftStorageBridge is Ownable {
    // Defining bridge object
    struct Bridge {
        string deal_uri;
        bool active;
        bool canceled;
        bool terminated;
        address owner;
        uint256 duration;
        address[] oracles;
        uint256 proving_schedule;
    }
    // Default oracle, which will be used if no oracle is sent
    address public default_oracle;
    // Max duration of a bridge deal
    uint256 public max_duration;
    // Timeout for bridge requests
    uint256 public request_timeout;
    // Counter for bridges
    uint256 internal bridges_counter;
    // Mapping to store bridges
    mapping(uint256 => Bridge) public bridges;
    // Mapping to store proofs for each bridge
    mapping(uint256 => mapping(uint256 => string)) public proofs;

    // Events
    event BridgeRequestCreated(
        uint256 index,
        address[] dealerAddress,
        address[] oracleAddress,
        uint256 duration,
        uint256 provingSchedule
    );
    event BridgeRequestAccepted(
        uint256 index
    );
    event BridgeInvalidated(
        uint256 index
    );

    constructor() {
        default_oracle = msg.sender;
    }

    // Function to create a bridge request
    function createBridge() external {}

    // Function to create a bridge request
    function acceptBridge() external {}

    // Function to check storage
    function checkStorage() external {}
}
