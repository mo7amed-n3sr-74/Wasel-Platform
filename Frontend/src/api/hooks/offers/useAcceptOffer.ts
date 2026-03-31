import { offerService } from "@/api/services/offer.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAcceptOffer(offerId: string) {
    const queryClient = useQueryClient();

    return (
        useMutation({
            mutationKey: ["acceptOffer"],
            mutationFn: () => (offerService.acceptOffer(offerId)),

            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["shipmentOffers"] })
            }
        })
    )
}