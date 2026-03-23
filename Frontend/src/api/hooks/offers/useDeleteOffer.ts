import { offerService } from "@/api/services/offer.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteOffer({ offerId }: { offerId: string }) {
    const queryClient = useQueryClient();

    return (
        useMutation({
            mutationKey: ["deleteOffer"],
            mutationFn: () => (offerService.deleteOffer(offerId)),

            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["allOffers"] })
            }
        })
    )
}
