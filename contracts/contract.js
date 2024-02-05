export async function handle(state, action) {
	const name = action.input.name;
	const caller = action.caller;
	switch (action.input.function) {
		case "helloWrite": {
			if (!name) {
				throw new ContractError(
					`Creator must provide a name.`
				);
			}

			if (state[caller]) {
				throw new ContractError(
					`Creator already added.`
				);
			}

			state[caller] = name;

			return { state };
		}
	}
}
