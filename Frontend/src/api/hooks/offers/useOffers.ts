import { offerService } from "@/api/services/offer.service";
import { useQuery } from "@tanstack/react-query";

export function useOffer() {
    return (
        useQuery({
            queryKey: ["allOffers"],
            queryFn: () => (offerService.getOffers())
        })
    )
}