import { offerService } from "@/api/services/offer.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateOffer(shipmentId: string | undefined, data: { price: number, proposal: string }) {
    const queryClient = useQueryClient();

    return (
        useMutation({
            mutationKey: ["newOffer"],
            mutationFn: () => (offerService.sendOffer(shipmentId, data)),

            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["allOffers"] })
            }
        })
    )
}