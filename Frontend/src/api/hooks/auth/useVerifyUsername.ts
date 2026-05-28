import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useVerifyUsername() {
    const { t } = useTranslation();

    return useMutation({
        mutationKey: ["verify-username"],
        mutationFn: (data: { username: string }) => authService.verifyUsername(data),

        onSuccess: (res) => {
            toast.success(t(res.data.message));
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err) ? err.response?.data?.message : "حدث شء ما خطأ";
            toast.error(t(axiosMeg));
        }
    });
}