import { privateHttpClient } from "../client/HttpClient";

class BalanceService {
	getBalance() {
		return privateHttpClient.get("wallet/balance");
	}

	getTransactions(query?: Record<string, unknown>) {
		const params = query && new URLSearchParams(
			Object.entries(query).map(([key, value]) => [
				key,
				String(value),
			]),
		);
		return privateHttpClient.get(`/transactions?${params}`);
	}
}

export const balanceService = new BalanceService();
