// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Web3BountyContract
 * Implementation of protocol described at:
 * https://hackmd.io/jBMffp3tRf6DU1f_D09VDQ
 */
 
contract Web3BountyContract is Ownable, ReentrancyGuard {
    // Defining deal object
    struct Deal {
        address owner;
        string data_uri;
        uint256 duration;
        uint256 value;
        bool canceled;
        bool claimed;
        uint256 timestamp_request;
        uint256 timestamp_start;
    }
    // Timeout for deal deals (default 8h)
    uint256 public request_timeout = 86_400;
    uint256 public max_duration = 31_536_000;
    // Counter for deals
    uint256 public deals_counter;
    // Allow or disallow payments
    bool public contract_protected = true;
    // Mapping to store deals
    mapping(uint256 => Deal) public deals;
    // Mapping allowed dealers
    mapping(address => bool) public dealers;

    // Events
    event DealProposalCreated(string data_uri, uint256 deal_id);
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
        This method will allow owner to enable or disable contract protection
    */
    function fixContractProtection(bool _state) external onlyOwner {
        contract_protected = _state;
    }

    /*
        This method will allow owner to fix max duration
    */
    function fixMaxDuration(uint256 _duration) external onlyOwner {
        max_duration = _duration;
    }

    // Function to create a storage request
    function createDealProposal(
        string memory _data_uri,
        address[] memory _dealers,
        address[] memory _oracle_addresses,
        uint256 _duration
    ) external payable returns (uint256 deal_id) {
        // Check if duration is lower than max
        require(_duration <= max_duration, "Duration is too long");
        // Check if contract is protected
        if (contract_protected) {
            require(
                msg.value == 0,
                "Contract is protected, can't accept value"
            );
        }

        // NOTE:
        // _dealers and _oracle_addresses are maintained for compatibility purposes
        // contract will not use them so we suggest to send them empty
        // See full bounty contract here: https://hackmd.io/2W6e_sAGTL-RBLYb1NsNUg

        // Setting next counter
        deals_counter++;
        // Create deal object
        deals[deals_counter].data_uri = _data_uri;
        deals[deals_counter].owner = msg.sender;
        deals[deals_counter].value = msg.value;
        deals[deals_counter].duration = _duration;
        deals[deals_counter].timestamp_request = block.timestamp;
        // Emitting deal request created event
        emit DealProposalCreated(_data_uri, deals_counter);
        return deals_counter;
    }

    // Function to determine if deal is active or not
    function isDealActive(uint256 _deal_id) public view returns (bool) {
        bool active = true;
        // Check if deal proposal exists
        if (deals[_deal_id].timestamp_request == 0) {
            active = false;
        }
        // Check if deal is canceled
        if (active && deals[_deal_id].canceled) {
            active = false;
        }
        // Check if deal expired
        if (
            active &&
            deals[_deal_id].duration > 0 &&
            deals[_deal_id].timestamp_start > 0 &&
            block.timestamp >
            (deals[_deal_id].timestamp_start + deals[_deal_id].duration)
        ) {
            active = false;
        }
        return active;
    }

    // Function to cancel a deal request before is accepted
    function cancelDealProposal(uint256 _deal_id) external nonReentrant {
        require(deals[_deal_id].timestamp_start == 0, "Deal was accepted, can't cancel");
        require(!deals[_deal_id].canceled, "Deal was canceled yet");
        require(
            deals[_deal_id].owner == msg.sender,
            "Can't cancel someone else request"
        );
        
        
        if (deals[_deal_id].value > 0) {
            // Send back payment
            bool success;
            (success, ) = payable(msg.sender).call{
                value: deals[_deal_id].value
            }("");
            require(success, "Withdraw to user failed");
        }
        // Invalidating deal request
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
    function acceptDealProposal(uint256 _deal_id) external {
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
            "Deal started yet, can't start"
        );
        // Set timestamp start
        deals[_deal_id].timestamp_start = block.timestamp;
        // Emit event
        emit DealAccepted(_deal_id);
    }

    // Function to create a deal request
    function claimBounty(uint256 _deal_id, bytes memory _proof)
        external
        nonReentrant
    {
        require(dealers[msg.sender], "Can't claim bounty, not a dealer");
        require(deals[_deal_id].timestamp_start > 0, "Deal didn't started");
        require(!deals[_deal_id].claimed, "Deal claimed yet");
        require(deals[_deal_id].value > 0, "Deal doesn't have value to claim");
        //KS-PLW-04 Dealer can claim bounty when deal is canceled 
        require(!deals[_deal_id].canceled, "Deal already canceled"); 
        // NOTE:
        // _proof is maintained for compatibility purposes
        // contract will not use it so we suggest to send it empty
        // See full bounty contract here: https://hackmd.io/2W6e_sAGTL-RBLYb1NsNUg

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
