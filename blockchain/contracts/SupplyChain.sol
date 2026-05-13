// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FurnitureSupplyChain {

    struct TimberBatch {
        string batchID;
        string supplierID;
        string forestLocation;
        string certificationStatus;  // e.g. "FSC Approved"
        uint256 harvestDate;
        address registeredBy;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => TimberBatch) public timberBatches;
    string[] public allBatchIDs;

    event TimberRegistered(
        string batchID,
        string supplierID,
        string forestLocation,
        address registeredBy,
        uint256 timestamp
    );

    // Register a new timber batch (Supplier only action)
    function registerTimberBatch(
        string memory _batchID,
        string memory _supplierID,
        string memory _forestLocation,
        string memory _certificationStatus,
        uint256 _harvestDate
    ) public {
        require(!timberBatches[_batchID].exists, "Batch already registered");

        timberBatches[_batchID] = TimberBatch({
            batchID: _batchID,
            supplierID: _supplierID,
            forestLocation: _forestLocation,
            certificationStatus: _certificationStatus,
            harvestDate: _harvestDate,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        allBatchIDs.push(_batchID);

        emit TimberRegistered(
            _batchID,
            _supplierID,
            _forestLocation,
            msg.sender,
            block.timestamp
        );
    }

    // Get a timber batch by ID
    function getTimberBatch(string memory _batchID)
        public view returns (TimberBatch memory)
    {
        require(timberBatches[_batchID].exists, "Batch not found");
        return timberBatches[_batchID];
    }

    // Get total number of batches
    function getTotalBatches() public view returns (uint256) {
        return allBatchIDs.length;
    }
}