// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3StorageBounty
 */
contract Web3StorageBounty is Ownable {
    // Defining bridge object
    struct Storage {
        address owner;
        string deal_uri;
        bool active;
        bool canceled;
        uint256 timestamp_request;
        uint256 timestamp_start;
    }
    // Timeout for bridge deals (default 8h)
    uint256 public request_timeout = 28_800;
    // Counter for deals
    uint256 public deals_counter;
    // Mapping to store deals
    mapping(uint256 => Storage) public deals;
    // Mapping to store active deals for each use
    mapping(address => mapping(string => uint256)) public active_deals;
    // Mapping to store status_updates for each bridge
    mapping(uint256 => mapping(uint256 => string)) public status_updates;
    // Counter for bridge status_updates
    mapping(uint256 => uint256) public status_updates_counter;
    // Mapping allowed dealers
    mapping(address => bool) public dealers;
    // Mapping allowed oracles
    mapping(address => bool) public oracles;

    // Events
    event StorageRequestCreated(
        string deal_uri,
        uint256 deal_id
    );
    event StorageRequestAccepted(uint256 deal_id);
    event StorageRequestCanceled(uint256 deal_id);
    event UpdateRequested(uint256 deal_id);
    event UpdateSent(uint256 deal_id, uint256 status_update_id, string status_update);

    /*
        This method will allow owner to enable or disable a dealer
    */
    function setDealerStatus(address _dealer, bool _state) external onlyOwner {
        dealers[_dealer] = _state;
    }

    /*
        This method will allow owner to enable or disable a dealer
    */
    function setOracleStatus(address _oracle, bool _state) external onlyOwner {
        oracles[_oracle] = _state;
    }

    // Function to create a storage request
    function createDealProposal(
        string memory _data_uri
    ) external {
        // Check if the user don't have same bridge active or a request expired
        require(
            active_deals[msg.sender][_data_uri] == 0 ||
                isStorageRequestExpired(active_deals[msg.sender][_data_uri]),
            "Another bridge exists for same deal_uri"
        );
        // Setting next counter
        deals_counter++;
        // Define active bridge as new one
        active_deals[msg.sender][_data_uri] = deals_counter;
        // Create bridge object
        deals[deals_counter].deal_uri = _data_uri;
        deals[deals_counter].owner = msg.sender;
        deals[deals_counter].active = true;
        deals[deals_counter].timestamp_request = block.timestamp;
        deals[deals_counter].contract_address = _contract;
        deals[deals_counter].token_id = _token_id;
        // Emitting bridge request created event
        emit StorageRequestCreated(
            _data_uri,
            deals_counter
        );
    }

    // Function to cancel a bridge request before is accepted
    function cancelRequest(uint256 _deal_id) external {
        require(deals[_deal_id].active, "Storage is not active");
        require(deals[_deal_id].owner == msg.sender, "Can't cancel someone else request");
        // Invalidating bridge request
        deals[_deal_id].active = false;
        deals[_deal_id].canceled = true;
        // Emitting bridge invalidated event
        emit StorageRequestCanceled(_deal_id);
    }

    // Function to check if bridge request expired
    function isStorageRequestExpired(uint256 _deal_id)
        public
        view
        returns (bool)
    {
        uint256 expiration = deals[_deal_id].timestamp_request +
            request_timeout;
        if (block.timestamp > expiration) {
            return true;
        }
        return false;
    }

    // Function to create a bridge request
    function acceptStorageRequest(uint256 _deal_id)
        external
    {
        require(dealers[msg.sender], "Can't accept bridge, not a dealer");
        require(
            !isStorageRequestExpired(_deal_id),
            "Can't accept bridge, expired"
        );
        require(
            deals[_deal_id].timestamp_start == 0,
            "Storage started yet, can't cancel"
        );
        deals[_deal_id].timestamp_start = block.timestamp;
    }

    // Function to check storage
    function checkStatus(uint256 _deal_id) external {
        require(deals[_deal_id].active, "Storage is not active");
        require(deals[_deal_id].owner == msg.sender, "Can't ask for update on someone else request");
        // Emit status_update sent event
        emit UpdateRequested(_deal_id);
    }

    // Function to check storage
    function statusUpdate(uint256 _deal_id, string memory _status_update) external {
        require(oracles[msg.sender], "Can't check storage, not an oracle");
        require(deals[_deal_id].active, "Storage is not active");
        // Setting new status_update id
        status_updates_counter[_deal_id]++;
        status_updates[_deal_id][status_updates_counter[_deal_id]] = _status_update;
        // Emit status_update sent event
        emit UpdateSent(_deal_id, status_updates_counter[_deal_id], _status_update);
    }
}
