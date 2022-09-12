// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

/**
 * @title NftStorageBridge
 */
contract NftStorageBridge is Ownable {
    // Defining bridge object
    struct Bridge {
        string deal_uri;
        string bridge_uri;
        address contract_address;
        uint8 contract_type;
        uint256 token_id;
        bool active;
        bool canceled;
        uint256 timestamp_request;
        uint256 timestamp_start;
    }
    // Timeout for bridge requests (default 8h)
    uint256 public request_timeout = 28_800;
    // Counter for bridges
    uint256 public bridges_counter;
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
    // Mapping allowed oracles
    mapping(address => bool) public oracles;
    // Mapping trusted addresses
    mapping(address => bool) public trusted_parties;

    // Events
    event BridgeRequestCreated(
        string deal_uri,
        uint256 bridge_id,
        address contract_address,
        uint256 token_id,
        uint8 contract_type
    );
    event BridgeRequestAccepted(uint256 bridge_id);
    event BridgeRequestCanceled(uint256 bridge_id);
    event ProofSent(uint256 bridge_id, uint256 proof_id, string proof);

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

    // Function to create a bridge request for a 721 token
    function create721Bridge(address _contract, uint256 _token_id) external {
        // Check if user is the owner of the token
        address owner = IERC721Metadata(_contract).ownerOf(_token_id);
        require(msg.sender == owner, "You're not the owner of the NFT");
        // Read tokenURI from contract
        string memory _deal_uri = IERC721Metadata(_contract).tokenURI(
            _token_id
        );
        // Pass everything to the internal function
        createBridge(_deal_uri, _contract, _token_id, 0);
    }

    // Function to create a bridge request for an 1155 token
    function create1155Bridge(address _contract, uint256 _token_id) external {
        // Check if user is the owner of the token
        uint256 balance = IERC1155MetadataURI(_contract).balanceOf(
            msg.sender,
            _token_id
        );
        require(balance > 0, "You don't own copies of the NFT");
        // Read tokenURI from contract
        string memory _deal_uri = IERC1155MetadataURI(_contract).uri(_token_id);
        // Pass everything to the internal function
        createBridge(_deal_uri, _contract, _token_id, 1);
    }

    // Function to create a bridge request from a trusted source
    function createTrustedBridge(
        address _contract,
        uint256 _token_id,
        string memory _deal_uri
    ) external {
        // Be sure there's at least 1 oracle
        require(trusted_parties[msg.sender], "You can't send requests here");
        // Pass everything to the internal function
        createBridge(_deal_uri, _contract, _token_id, 2);
    }

    function createBridge(
        string memory _deal_uri,
        address _contract,
        uint256 _token_id,
        uint8 _contract_type
    ) private {
        // Check if the user don't have same bridge active or a request expired
        require(
            active_bridges[msg.sender][_deal_uri] == 0 ||
                isBridgeRequestExpired(active_bridges[msg.sender][_deal_uri]),
            "Another bridge exists for same deal_uri"
        );
        // Setting next counter
        bridges_counter++;
        // Define active bridge as new one
        active_bridges[msg.sender][_deal_uri] = bridges_counter;
        // Create bridge object
        bridges[bridges_counter].deal_uri = _deal_uri;
        bridges[bridges_counter].active = true;
        bridges[bridges_counter].timestamp_request = block.timestamp;
        bridges[bridges_counter].contract_address = _contract;
        bridges[bridges_counter].token_id = _token_id;
        // Emitting bridge request created event
        emit BridgeRequestCreated(
            _deal_uri,
            bridges_counter,
            _contract,
            _token_id,
            _contract_type
        );
    }

    // Function to cancel a bridge request before is accepted
    function cancelBridge(uint256 _bridge_id) external {
        require(bridges[_bridge_id].active, "Bridge is not active");
        // Invalidating bridge request
        bridges[_bridge_id].active = false;
        bridges[_bridge_id].canceled = true;
        // Emitting bridge invalidated event
        emit BridgeRequestCanceled(_bridge_id);
    }

    // Function to check if bridge request expired
    function isBridgeRequestExpired(uint256 _bridge_id)
        public
        view
        returns (bool)
    {
        uint256 expiration = bridges[_bridge_id].timestamp_request +
            request_timeout;
        if (block.timestamp > expiration ) {
            return true;
        }
        return false;
    }

    // Function to create a bridge request
    function acceptBridge(uint256 _bridge_id, string memory _bridge_uri)
        external
    {
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
        bridges[_bridge_id].bridge_uri = _bridge_uri;
    }

    // Function to check storage
    function checkStorage(uint256 _bridge_id, string memory _proof) external {
        require(oracles[msg.sender], "Can't check storage, not an oracle");
        require(bridges[_bridge_id].active, "Bridge is not active");
        // Setting new proof id
        proofs_counter[_bridge_id]++;
        proofs[_bridge_id][proofs_counter[_bridge_id]] = _proof;
        // Emit proof sent event
        emit ProofSent(_bridge_id, proofs_counter[_bridge_id], _proof);
    }
}
