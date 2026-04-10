import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/api/services/offer.service";

export function useRecentOffer() {
    return useQuery({
        queryKey: ["recentOffer"],
        queryFn: () => offerService.getRecentOffers()
    })
}