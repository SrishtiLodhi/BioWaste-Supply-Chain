const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZEROADDRESS = ethers.constants.AddressZero;

describe("BioWasteSupplyChain", function () {
	let bioWasteSupplyChain, admin, accounts, supplier, transporter, disposer;

	beforeEach(async () => {
		accounts = await ethers.getSigners();

		// roles

		admin = accounts[0];
		supplier = accounts[7];
		transporter = accounts[8];
		disposer = accounts[9];

		// deploy BioWasteSupplyChain
		const BioWasteSupplyChain = await hre.ethers.getContractFactory(
			"BioWasteSupplyChain"
		);
		bioWasteSupplyChain = await BioWasteSupplyChain.deploy();

		await bioWasteSupplyChain.deployed();

		// set Roles
		await bioWasteSupplyChain.setRole(supplier.address, 1, 0, 0);
		await bioWasteSupplyChain.setRole(transporter.address, 0, 1, 0);
		await bioWasteSupplyChain.setRole(disposer.address, 0, 0, 1);
	});

	it("integrated testing", async function () {
		// supplier creates bioWaste of wait 100 kg

		const createBioWasteTx = await bioWasteSupplyChain
			.connect(supplier)
			.createBioWaste("100");

		await createBioWasteTx.wait();

		// expect to emit BioWasteCreated event
		await expect(createBioWasteTx).to.emit(
			bioWasteSupplyChain,
			"BioWasteCreated"
		);

		// transporter collects bioWaste

		const collectBioWaste = await bioWasteSupplyChain
			.connect(transporter)
			.collectBioWaste("1");

		await collectBioWaste.wait();

		// expect to emit BioWasteCreated event
		await expect(collectBioWaste).to.emit(
			bioWasteSupplyChain,
			"BioWasteCollected"
		);

		// transporter transports bioWaste

		const transportBioWaste = await bioWasteSupplyChain
			.connect(transporter)
			.transportBioWaste("1");

		await transportBioWaste.wait();

		// expect to emit BioWasteCreated event
		await expect(transportBioWaste).to.emit(
			bioWasteSupplyChain,
			"BioWasteTransported"
		);

		// disposer disposes bioWaste

		const disposeBioWaste = await bioWasteSupplyChain
			.connect(disposer)
			.disposeBioWaste("1");

		await disposeBioWaste.wait();

		// expect to emit BioWasteCreated event
		await expect(disposeBioWaste).to.emit(
			bioWasteSupplyChain,
			"BioWasteDisposed"
		);
	});
});
