import { balanceService } from "@/api/services/balance.service";
import { useQuery } from "@tanstack/react-query";

export function useTransactions() {
	return useQuery({
		queryKey: ["transactions"],
		queryFn: () => balanceService.getTransactions(),
	});
}
