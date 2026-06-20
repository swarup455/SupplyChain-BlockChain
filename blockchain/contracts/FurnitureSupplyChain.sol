// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FurnitureSupplyChain {

    enum Stage {
        TimberRegistered,    // 0 - Supplier registers timber
        ManufacturingDone,   // 1 - Manufacturer creates finished product
        Dispatched,          // 2 - Manufacturer dispatches to Distributor
        RetailReceived,      // 3 - Distributor transfers to Retailer
        CustomerVerified     // 4 - Retailer transfers to Customer
    }

    enum Role { Supplier, Manufacturer, Distributor, Retailer, Customer }

    struct Product {
        string productID;
        string timberBatchID;
        address currentOwner;
        Stage stage;
        uint256 timestamp;
        bool exists;
        bool timberUsed;     // true = this timber has been consumed by Manufacturer
    }

    struct HistoryEntry {
        address actor;
        Stage stage;
        uint256 timestamp;
        string notes;
    }

    mapping(address => Role) public roles;
    mapping(address => bool) public isRegistered;
    address public admin;

    mapping(string => Product) public products;
    mapping(string => HistoryEntry[]) public productHistory;
    string[] public allProductIDs;

    event RoleAssigned(address wallet, Role role);
    event ProductRegistered(string productID, address supplier, uint256 timestamp);
    event FinishedProductCreated(string newProductID, string sourceTimberID, address manufacturer, uint256 timestamp);
    event OwnershipTransferred(string productID, address from, address to, Stage newStage);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyRole(Role _role) {
        require(isRegistered[msg.sender] && roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    // ── Admin assigns roles ──────────────────────────────────────────────────
    function assignRole(address _wallet, Role _role) public onlyAdmin {
        roles[_wallet] = _role;
        isRegistered[_wallet] = true;
        emit RoleAssigned(_wallet, _role);
    }

    // ── Supplier registers raw timber ────────────────────────────────────────
    function registerProduct(
        string memory _productID,
        string memory _timberBatchID,
        string memory _notes
    ) public onlyRole(Role.Supplier) {
        require(!products[_productID].exists, "Product already exists");

        products[_productID] = Product({
            productID: _productID,
            timberBatchID: _timberBatchID,
            currentOwner: msg.sender,
            stage: Stage.TimberRegistered,
            timestamp: block.timestamp,
            exists: true,
            timberUsed: false
        });

        productHistory[_productID].push(HistoryEntry({
            actor: msg.sender,
            stage: Stage.TimberRegistered,
            timestamp: block.timestamp,
            notes: _notes
        }));

        allProductIDs.push(_productID);
        emit ProductRegistered(_productID, msg.sender, block.timestamp);
    }

    // ── Manufacturer creates finished product from timber ────────────────────
    function createFinishedProduct(
        string memory _newProductID,
        string memory _sourceTimberID,
        string memory _notes
    ) public onlyRole(Role.Manufacturer) {
        require(products[_sourceTimberID].exists, "Timber not found");
        require(products[_sourceTimberID].currentOwner == msg.sender, "Timber not assigned to you");
        require(!products[_sourceTimberID].timberUsed, "Timber already used");
        require(!products[_newProductID].exists, "Product ID already exists");

        // Mark source timber as consumed
        products[_sourceTimberID].timberUsed = true;

        // Register the new finished product
        products[_newProductID] = Product({
            productID: _newProductID,
            timberBatchID: _sourceTimberID,
            currentOwner: msg.sender,
            stage: Stage.ManufacturingDone,
            timestamp: block.timestamp,
            exists: true,
            timberUsed: false
        });
        // Copy supplier history from timber batch
        HistoryEntry[] storage oldHistory = productHistory[_sourceTimberID];

        for (uint i = 0; i < oldHistory.length; i++) {
    productHistory[_newProductID].push(oldHistory[i]);
}

        productHistory[_newProductID].push(HistoryEntry({
            actor: msg.sender,
            stage: Stage.ManufacturingDone,
            timestamp: block.timestamp,
            notes: _notes
        }));

        allProductIDs.push(_newProductID);
        emit FinishedProductCreated(_newProductID, _sourceTimberID, msg.sender, block.timestamp);
    }

    // ── Transfer ownership to next stakeholder ───────────────────────────────
    function transferOwnership(
        string memory _productID,
        address _newOwner,
        string memory _notes
    ) public {
        Product storage p = products[_productID];
        require(p.exists, "Product not found");
        require(p.currentOwner == msg.sender, "Not current owner");
        require(isRegistered[_newOwner], "Recipient not registered");
        require(!p.timberUsed, "This timber has been consumed, use the finished product");

        Stage nextStage = Stage(uint(p.stage) + 1);
        require(uint(nextStage) <= uint(Stage.CustomerVerified), "Already at final stage");

        p.currentOwner = _newOwner;
        p.stage = nextStage;
        p.timestamp = block.timestamp;

        productHistory[_productID].push(HistoryEntry({
            actor: msg.sender,
            stage: nextStage,
            timestamp: block.timestamp,
            notes: _notes
        }));

        emit OwnershipTransferred(_productID, msg.sender, _newOwner, nextStage);
    }

    // ── Read functions ───────────────────────────────────────────────────────
    function getProduct(string memory _productID)
        public view returns (Product memory)
    {
        require(products[_productID].exists, "Product not found");
        return products[_productID];
    }

    function getProductHistory(string memory _productID)
        public view returns (HistoryEntry[] memory)
    {
        require(products[_productID].exists, "Product not found");
        return productHistory[_productID];
    }

    function isTimberUsed(string memory _productID)
        public view returns (bool)
    {
        require(products[_productID].exists, "Product not found");
        return products[_productID].timberUsed;
    }
}