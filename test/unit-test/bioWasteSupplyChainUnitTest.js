const { expect, assert } = require("chai");
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

	describe("createBioWaste", function () {
		describe("Positive cases", function () {
			it("create bioWaste with given weight", async function () {
				// expect to emit the event
				await expect(
					bioWasteSupplyChain.connect(supplier).createBioWaste("100")
				)
					.to.emit(bioWasteSupplyChain, "BioWasteCreated")
					.withArgs("1", supplier.address);

				// check mapping
				const bioWaste = await bioWasteSupplyChain.bioWastes(1);

				assert.equal(bioWaste.id.toString(), "1");
				assert.equal(bioWaste.supplier, supplier.address);
				assert.equal(bioWaste.transporter, ZEROADDRESS);
				assert.equal(bioWaste.disposer, ZEROADDRESS);
				assert.equal(bioWaste.weight.toString(), "100");
				assert.equal(bioWaste.state.toString(), "0");
			});
		});

		describe("Negative cases", async function () {
			it("reverts when createBioWaste not called by supplier", async function () {
				await expect(
					bioWasteSupplyChain.connect(accounts[3]).createBioWaste("100")
				).to.be.revertedWith("Only a supplier can perform this action.");
			});
		});
	});

	describe("collectBioWaste ", function () {
		describe("Positive cases", function () {
			it("collect bioWaste with given weight", async function () {
				await bioWasteSupplyChain.connect(supplier).createBioWaste("100");
				// expect to emit the event
				await expect(
					bioWasteSupplyChain.connect(transporter).collectBioWaste("1")
				)
					.to.emit(bioWasteSupplyChain, "BioWasteCollected")
					.withArgs("1", transporter.address);

				// check mapping
				const bioWaste = await bioWasteSupplyChain.bioWastes(1);

				assert.equal(bioWaste.id.toString(), "1");
				assert.equal(bioWaste.supplier, supplier.address);
				assert.equal(bioWaste.transporter, transporter.address);
				assert.equal(bioWaste.disposer, ZEROADDRESS);
				assert.equal(bioWaste.weight.toString(), "100");
				assert.equal(bioWaste.state.toString(), "1");
			});
		});

		describe("Negative cases", async function () {
			it("reverts when collectBioWaste not called by transporter", async function () {
				await expect(
					bioWasteSupplyChain.connect(accounts[3]).collectBioWaste("1")
				).to.be.revertedWith("Only a transporter can perform this action.");
			});
		});
	});

	describe("transportBioWaste ", function () {
		describe("Positive cases", function () {
			it("transport bioWaste with given weight", async function () {
				await bioWasteSupplyChain.connect(supplier).createBioWaste("100");
				await bioWasteSupplyChain.connect(transporter).collectBioWaste("1");
				// expect to emit the event
				await expect(
					bioWasteSupplyChain.connect(transporter).transportBioWaste("1")
				)
					.to.emit(bioWasteSupplyChain, "BioWasteTransported")
					.withArgs("1", transporter.address);

				// check mapping
				const bioWaste = await bioWasteSupplyChain.bioWastes(1);

				assert.equal(bioWaste.id.toString(), "1");
				assert.equal(bioWaste.supplier, supplier.address);
				assert.equal(bioWaste.transporter, transporter.address);
				assert.equal(bioWaste.disposer, ZEROADDRESS);
				assert.equal(bioWaste.weight.toString(), "100");
				assert.equal(bioWaste.state.toString(), "2");
			});
		});

		describe("Negative cases", async function () {
			it("reverts when collectBioWaste not called by transporter", async function () {
				await expect(
					bioWasteSupplyChain.connect(accounts[3]).transportBioWaste("1")
				).to.be.revertedWith("Only a transporter can perform this action.");
			});
		});
	});

	describe("disposeBioWaste", function () {
		describe("Positive cases", function () {
			it("dispose bioWaste with given weight", async function () {
				await bioWasteSupplyChain.connect(supplier).createBioWaste("100");
				await bioWasteSupplyChain.connect(transporter).collectBioWaste("1");
				await bioWasteSupplyChain.connect(transporter).transportBioWaste("1");
				// expect to emit the event
				await expect(bioWasteSupplyChain.connect(disposer).disposeBioWaste("1"))
					.to.emit(bioWasteSupplyChain, "BioWasteDisposed")
					.withArgs("1", disposer.address);

				// check mapping
				const bioWaste = await bioWasteSupplyChain.bioWastes(1);

				assert.equal(bioWaste.id.toString(), "1");
				assert.equal(bioWaste.supplier, supplier.address);
				assert.equal(bioWaste.transporter, transporter.address);
				assert.equal(bioWaste.disposer, disposer.address);
				assert.equal(bioWaste.weight.toString(), "100");
				assert.equal(bioWaste.state.toString(), "3");
			});
		});

		describe("Negative cases", async function () {
			it("reverts when disposeBioWaste not called by disposer", async function () {
				await expect(
					bioWasteSupplyChain.connect(accounts[3]).disposeBioWaste("1")
				).to.be.revertedWith("Only a disposer can perform this action.");
			});
		});
	});
});
