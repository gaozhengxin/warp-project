import fs from "fs";
import * as path from "path";
import * as WarpSdk from "warp-contracts";
import { DeployPlugin } from "warp-contracts-plugin-deploy";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractSrc = fs.readFileSync(
	path.join(__dirname, "./contracts/token.js"),
	"utf8"
);
const initialState = fs.readFileSync(
	path.join(__dirname, "./contracts/token-initState.json"),
	"utf8"
);

const run = async () => {
	const warp = WarpSdk.WarpFactory.forLocal().use(new DeployPlugin());

	const wallet1 = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, "../jwk.json").toString(),
			"utf-8"
		)
	);

	const wallet2 = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, "../jwk-2.json").toString(),
			"utf-8"
		)
	);

	const walletAddress1 = await warp.arweave.wallets.jwkToAddress(wallet1);
	const walletAddress2 = await warp.arweave.wallets.jwkToAddress(wallet2);

	console.log("address 1 " + walletAddress1);
	console.log("address 2 " + walletAddress2);

	const { contractTxId } = await warp.deploy({
		wallet: wallet1,
		initState: initialState,
		src: contractSrc,
	});
	console.log(`contractTxId: `, contractTxId);

	let contract = warp
		.contract(contractTxId)
		.connect(wallet1)
		.setEvaluationOptions({
			mineArLocalBlocks: true,
			waitForConfirmation: true,
		});

	let res = await contract.writeInteraction(
		{
			function: "transfer",
			target: walletAddress2,
			qty: 10,
		},
		{ strict: true }
	);
	console.log(`res: %s`, res);

	let res2 = await contract.writeInteraction(
		{
			function: "transfer",
			target: walletAddress2,
			qty: 5000,
		},
		{ strict: false }
	);
	console.log(`res2: %s`, res2);

	let res3 = await contract.writeInteraction(
		{
			function: "transfer",
			target: walletAddress2,
			qty: 2,
		},
		{ strict: false }
	);
	console.log(`res3: %s`, res3);

	const writeTx = await warp.arweave.transactions.get(res.originalTxId);
	console.log(`writeTx block: %s`, {
		height: writeTx.height,
		block: writeTx.block,
	});

	// get current block of mainnet
	//const arweaveWrapper = new WarpSdk.ArweaveWrapper(warp);
	//let block = await arweaveWrapper.warpGwBlock();
	// get current block from arlocal
	let block = await warp.arweave.blocks.getCurrent();
	console.log(`current block: %s`, block.height);

	const { sortKey, cachedValue } = await contract.readState(block.height);
	console.log(`sortKey value: %s`, sortKey);
	console.log(`cached value: %s`, JSON.stringify(cachedValue));
};

run();
