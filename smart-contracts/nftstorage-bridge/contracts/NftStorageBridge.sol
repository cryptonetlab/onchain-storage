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
        uint256 timestamp_request;
        uint256 timestamp_start;
        uint256 duration;
        address[] oracles;
        uint256 proving_schedule;
    }
    // Default oracle, which will be used if no oracle is sent
    address public default_oracle;
    // Max duration of a bridge deal
    uint256 public max_duration;
    // Timeout for bridge requests (default 8h)
    uint256 public request_timeout = 28_800;
    // Counter for bridges
    uint256 internal bridges_counter;
    // Mapping to store bridges
    mapping(uint256 => Bridge) public bridges;
    // Mapping to store active bridges for each use
    mapping(address => mapping(string => uint256)) public active_bridges;
    // Mapping to store proofs for each bridge
    mapping(uint256 => mapping(uint256 => string)) public proofs;
    // Counter for bridge proofs
    mapping(uint256 => uint256) public proofs_counter;
    // Mapping allowed dealers
    mapping(address => bool) public dealers;

    // Events
    event BridgeRequestCreated(
        string _deal_uri,
        uint256 bridge_id,
        address[] oracleAddress,
        uint256 duration
    );
    event BridgeRequestAccepted(uint256 bridge_id);
    event BridgeInvalidated(uint256 bridge_id);
    event ProofSent(uint256 bridge_id, uint256 proof_id, string proof);

    constructor() {
        default_oracle = msg.sender;
    }

    /*
        This method will allow owner to enable or disable a dealer
    */
    function setDealerStatus(address _dealer, bool _state) external onlyOwner {
        dealers[_dealer] = _state;
    }

    // Function to create a bridge request
    function createBridge(
        string memory _deal_uri,
        address[] memory _oracles,
        uint256 _duration
    ) external {
        // Check if the user don't have same bridge active
        require(
            active_bridges[msg.sender][_deal_uri] == 0,
            "Another bridge exists for same deal_uri"
        );
        // Setting next counter
        bridges_counter++;
        // Define active bridge as new one
        active_bridges[msg.sender][_deal_uri] = bridges_counter;
        // Create bridge object
        bridges[bridges_counter].deal_uri = _deal_uri;
        bridges[bridges_counter].active = true;
        bridges[bridges_counter].owner = msg.sender;
        bridges[bridges_counter].duration = _duration;
        bridges[bridges_counter].oracles = _oracles;
        bridges[bridges_counter].timestamp_request = block.timestamp;
        // Emitting bridge request created event
        emit BridgeRequestCreated(
            _deal_uri,
            bridges_counter,
            _oracles,
            _duration
        );
    }

    // Function to cancel a bridge request before is accepted
    function cancelBridge(uint256 _bridge_id) external {
        require(bridges[_bridge_id].active, "Bridge is not active");
        require(
            bridges[_bridge_id].owner == msg.sender,
            "Sender is not the owner"
        );
        require(
            bridges[_bridge_id].timestamp_start == 0,
            "Bridge started yet, can't cancel"
        );
        // Invalidating bridge request
        bridges[_bridge_id].active = false;
        bridges[_bridge_id].canceled = true;
        // Emitting bridge invalidated event
        emit BridgeInvalidated(_bridge_id);
    }

    // Function to check if oracle address exists in bridge
    function isOracleInBridge(address _oracle, uint256 _bridge_id)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < bridges[_bridge_id].oracles.length; i++) {
            if (bridges[_bridge_id].oracles[i] == _oracle) {
                return true;
            }
        }

        return false;
    }

    // Function to check if bridge request expired
    function isBridgeRequestExpired(uint256 _bridge_id)
        public
        view
        returns (bool)
    {
        uint256 expiration = bridges[_bridge_id].timestamp_request +
            request_timeout;
        if (block.timestamp > expiration) {
            return true;
        }
        return false;
    }

    // Function to create a bridge request
    function acceptBridge(uint256 _bridge_id) external {
        require(dealers[msg.sender], "Can't accept bridge, not a dealer");
        require(
            !isBridgeRequestExpired(_bridge_id),
            "Can't accept bridge, expired"
        );
        require(
            bridges[_bridge_id].timestamp_start == 0,
            "Bridge started yet, can't cancel"
        );
        bridges[_bridge_id].timestamp_start = block.timestamp;
    }

    // Function to check storage
    function checkStorage(uint256 _bridge_id, string memory _proof) external {
        require(
            isOracleInBridge(msg.sender, _bridge_id),
            "Can't accept bridge, not an allowed oracle"
        );
        require(bridges[_bridge_id].active, "Bridge is not active");
        // Setting new proof id
        proofs_counter[_bridge_id]++;
        proofs[_bridge_id][proofs_counter[_bridge_id]] = _proof;
        // Emit proof sent event
        emit ProofSent(_bridge_id, proofs_counter[_bridge_id], _proof);
    }
}
