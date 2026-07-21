import { balanceService } from "@/api/services/balance.service";
import { useQuery } from "@tanstack/react-query";

export function useBalance() {
	return useQuery({
		queryKey: ["balance"],
		queryFn: () => balanceService.getBalance(),
	});
}
