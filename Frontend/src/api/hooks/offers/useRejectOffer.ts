import { offerService } from "@/api/services/offer.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useRejectOffer(offerId: string)  {
    const queryClient = useQueryClient();

    return (
        useMutation({
            mutationKey: ["rejectOffer"],
            mutationFn: () => (offerService.rejectOffer(offerId)),

            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["shipmentOffers"] })
            }
        })
    )
}