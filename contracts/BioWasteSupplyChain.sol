// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract BioWasteSupplyChain {
    address admin;
    // Roles

    struct Role {
        address userAddress;
        bool isSupplier;
        bool isTransporter;
        bool isDisposer;
    }

    // BioWaste state
    enum State {
        Created,
        Collected,
        Transported,
        Disposed
    }

    // BioWaste data
    struct BioWaste {
        uint id;
        address supplier;
        address transporter;
        address disposer;
        uint weight;
        State state;
    }

    // Global variables
    uint public bioWasteCount = 0;
    mapping(uint => BioWaste) public bioWastes;
    mapping(address => Role) public roles;

    // Events
    event BioWasteCreated(uint id, address supplier);
    event BioWasteCollected(uint id, address transporter);
    event BioWasteTransported(uint id, address transporter);
    event BioWasteDisposed(uint id, address disposer);

    // constructor
    constructor() {
        admin = msg.sender;
    }

    // only owner
    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin");
        _;
    }

    // Modifiers
    modifier onlySupplier() {
        require(
            roles[msg.sender].isSupplier,
            "Only a supplier can perform this action."
        );
        _;
    }

    modifier onlyTransporter() {
        require(
            roles[msg.sender].isTransporter,
            "Only a transporter can perform this action."
        );
        _;
    }

    modifier onlyDisposer() {
        require(
            roles[msg.sender].isDisposer,
            "Only a disposer can perform this action."
        );
        _;
    }

    // Functions
    function createBioWaste(uint weight) public onlySupplier {
        bioWasteCount++;
        bioWastes[bioWasteCount] = BioWaste(
            bioWasteCount,
            msg.sender,
            address(0),
            address(0),
            weight,
            State.Created
        );
        emit BioWasteCreated(bioWasteCount, msg.sender);
    }

    function collectBioWaste(uint id) public onlyTransporter {
        require(
            bioWastes[id].state == State.Created,
            "BioWaste is not in a state where it can be collected."
        );
        bioWastes[id].transporter = msg.sender;
        bioWastes[id].state = State.Collected;
        emit BioWasteCollected(id, msg.sender);
    }

    function transportBioWaste(uint id) public onlyTransporter {
        require(
            bioWastes[id].state == State.Collected,
            "BioWaste is not in a state where it can be transported."
        );
        bioWastes[id].state = State.Transported;
        emit BioWasteTransported(id, msg.sender);
    }

    function disposeBioWaste(uint id) public onlyDisposer {
        require(
            bioWastes[id].state == State.Transported,
            "BioWaste is not in a state where it can be disposed."
        );
        bioWastes[id].disposer = msg.sender;
        bioWastes[id].state = State.Disposed;
        emit BioWasteDisposed(id, msg.sender);
    }

    function setRole(
        address roleAddress,
        bool isSupplier,
        bool isTransporter,
        bool isDisposer
    ) external onlyAdmin {
        roles[roleAddress] = Role(
            roleAddress,
            isSupplier,
            isTransporter,
            isDisposer
        );
    }

    // getter functions
    function getRole(address roleAddress) public view returns (Role memory) {
        return roles[roleAddress];
    }
}
