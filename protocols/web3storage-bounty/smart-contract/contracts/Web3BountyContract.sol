// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Web3BountyContract
 */
contract Web3BountyContract is Ownable, ReentrancyGuard {
    // Defining deal object
    struct Deal {
        address owner;
        string deal_uri;
        bool active;
        bool canceled;
        uint256 value;
        uint256 timestamp_request;
        uint256 timestamp_start;
    }
    // Timeout for deal deals (default 8h)
    uint256 public request_timeout = 86_400;
    // Counter for deals
    uint256 public deals_counter;
    // Allow or disallow payments
    bool public contract_protected = false;
    // Mapping to store deals
    mapping(uint256 => Deal) public deals;
    // Mapping to store active deals for each use
    mapping(address => mapping(string => uint256)) public active_deals;
    // Mapping allowed dealers
    mapping(address => bool) public dealers;
    // Mapping allowed oracles
    mapping(address => bool) public oracles;

    // Events
    event DealProposalCreated(string deal_uri, uint256 deal_id);
    event DealAccepted(uint256 deal_id);
    event DealProposalCanceled(uint256 deal_id);
    event BountyClaimed(uint256 deal_id);

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

    function fixContractProtection(_state) external onlyOwner {
        contract_protected = state;
    }

    // Function to create a storage request
    function createDealProposal(
        string memory _data_uri,
        address[] dealers,
        address[] oracle_addresses,
        uint256 duration
    ) external payable {
        // Check if contract is protected
        if (contract_protected) {
            require(
                msg.value == 0,
                "Contract is protected, can't accept value"
            );
        }

        // QUESTION: Check if dealers are valid?
        // QUESTION: Do we need to store oracle addresses or not?
        // QUESTION: Is duration in web3.storage bounty hardcoded?

        // Check if the user don't have same deal active or a request expired
        require(
            active_deals[msg.sender][_data_uri] == 0 ||
                isDealProposalExpired(active_deals[msg.sender][_data_uri]),
            "Deal proposal is expired"
        );
        // Setting next counter
        deals_counter++;
        // Define active deal as new one
        active_deals[msg.sender][_data_uri] = deals_counter;
        // Create deal object
        deals[deals_counter].deal_uri = _data_uri;
        deals[deals_counter].owner = msg.sender;
        deals[deals_counter].value = msg.value;
        deals[deals_counter].active = true;
        deals[deals_counter].timestamp_request = block.timestamp;
        // Emitting deal request created event
        emit DealProposalCreated(_data_uri, deals_counter);
    }

    // Function to cancel a deal request before is accepted
    function cancelDealProposal(uint256 _deal_id) external nonReentrant {
        require(deals[_deal_id].active, "Deal is not active");
        require(
            deals[_deal_id].owner == msg.sender,
            "Can't cancel someone else request"
        );
        // Send back payment
        bool success;
        (success, ) = payable(msg.sender).call{value: deals[_deal_id].value}(
            ""
        );
        require(success, "Withdraw to user failed");
        // Invalidating deal request
        deals[_deal_id].active = false;
        deals[_deal_id].canceled = true;
        // Emitting deal invalidated event
        emit DealProposalCanceled(_deal_id);
    }

    // Function to check if deal request expired
    function isDealProposalExpired(uint256 _deal_id)
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

    // Function to create a deal request
    function acceptDealRequest(uint256 _deal_id) external {
        require(
            dealers[msg.sender],
            "Can't accept deal proposal, not a dealer"
        );
        require(
            !isDealProposalExpired(_deal_id),
            "Can't accept deal proposal, expired"
        );
        require(
            deals[_deal_id].timestamp_start == 0,
            "Deal started yet, can't cancel"
        );
        // Set timestamp start
        deals[_deal_id].timestamp_start = block.timestamp;
        // Emit event
        emit DealAccepted(_deal_id);
    }

    // Function to create a deal request
    function ClaimBounty(uint256 _deal_id) external nonReentrant {
        require(dealers[msg.sender], "Can't claim bounty, not a dealer");
        require(deals[_deal_id].active, "Deal is not active");
        require(!deals[_deal_id].claimed, "Deal claimed yet");
        require(!deals[_deal_id].value > 0, "Deal doesn't have value to claim");
        // Send bounty to dealer
        bool success;
        (success, ) = payable(msg.sender).call{value: deals[_deal_id].value}(
            ""
        );
        require(success, "Withdraw to user failed");
        // Set claimed status to true
        deals[_deal_id].claimed = true;
        // Emit event
        emit BountyClaimed(_deal_id);
    }
}
