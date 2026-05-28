import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function useForgetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ["forgetPassword"],
        mutationFn: (data: { email: string }) => authService.forgetPassword(data),

        onSuccess: (res) => {
            toast.success(t(res.data.message));
            navigate('/verification')
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err) ? err.response?.data?.message : "شئ ما حدث خطا";
            toast.error(t(axiosMeg));
        }
    })
}