import { offerService } from "@/api/services/offer.service";
import { useQuery } from "@tanstack/react-query";

export function useOffer({ offerId }: { offerId: string }) {
    return (
        useQuery({
            queryKey: ["offer"],
            queryFn: () => offerService.getOffer(offerId)
        })
    )
}