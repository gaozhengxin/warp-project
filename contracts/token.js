// file: token.js
export async function handle(state, action) {
	if (action.input.function === "transfer") {
		const { target, qty } = action.input;

		if (!target || !qty) {
			throw new ContractError("Invalid input");
		}

		const balance = state.balances[action.caller] || 0;

		if (balance < qty) {
			throw new ContractError("Insufficient balance");
		}

		// 执行转账
		state.balances[action.caller] -= qty;
		state.balances[target] = (state.balances[target] || 0) + qty;
	}

	return { state };
}
