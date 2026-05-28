import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/services/auth.service";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function useVerifyOtp() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ["otpVerification"],
        mutationFn: (data: { email: string, otp: string }) => authService.verifyOtp(data),

        onSuccess: (res) => {
            toast.success(res.data.message);
            navigate(`/resetpassword?e=${res.data.resetToken}`)
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err) ? err.response?.data?.message : "شء ما حدث خطأ";
            const axiosStatus = isAxiosError(err) ? err.response?.status : 500;

            if (axiosStatus === 501) {
                setTimeout(() => {
                    navigate("/forgetpassword");
                }, 3000);
            }

            toast.error(t(axiosMeg));
        }
    })
}