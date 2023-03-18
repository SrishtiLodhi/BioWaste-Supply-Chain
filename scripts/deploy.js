const hre = require("hardhat");

async function main() {
	const BioWasteSupplyChain = await hre.ethers.getContractFactory(
		"BioWasteSupplyChain"
	);
	const bioWasteSupplyChain = await BioWasteSupplyChain.deploy();

	await bioWasteSupplyChain.deployed();

	console.log(`BioWasteSupplyChain deployed to ${bioWasteSupplyChain.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
