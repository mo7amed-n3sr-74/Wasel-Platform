import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { drievrsService } from "@/api/services/drivers.service";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useDeleteDriver() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (driverId: string) => drievrsService.deleteDriver(driverId),

        onSuccess: (res) => {
            toast.success(t(res.data.message || 'تم حذف السائق بنجاح'));
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err) ? err.response?.data?.message : "شئ ما حدث خطأ";
            toast.error(t(axiosMeg));
        }
    })
}