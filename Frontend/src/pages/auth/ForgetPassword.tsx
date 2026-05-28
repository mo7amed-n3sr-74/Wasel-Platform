import { useRef, useState, type FormEvent } from "react";
import { PiEnvelopeLight, PiCaretRight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { useProps } from "@/components/PropsProvider";
import { Link } from "react-router-dom";
import Main from "@/components/Main";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { useForgetPassword } from "@/api/hooks/auth/useForgetPassword";

function ForgetPassword() {
	const resetBtn = useRef<HTMLButtonElement | null>(null);
	const [email, setEmail] = useState<string>("");
	const { t } = useTranslation();
	const { isLoading, setIsLoading } = useProps();
	const { mutate } = useForgetPassword();

	const handlingSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email) {
			toast.error(t("من فضلك أدخل الإيميل أولاً"));
			return;
		}

		try {
			setIsLoading(true);
			mutate({
				email
			});
			window.sessionStorage.setItem("email", email);
		} catch (err) {
			console.log(err);
		} finally {
			setEmail("");
			setIsLoading(false);
		}
	};

	return (
		<Main auth>
			<div className="container mx-auto min-h-screen flex items-center justify-center">
				<div className="w-120 flex flex-col items-center p-6 bg-(--secondary-color) shadow-2xl shadow-black/10 rounded-3xl mt-20">
					<h2 className="font-main font-semibold text-3xl text-(--primary-text) text-center mb-2">
						إستعادة كلمة المرور
					</h2>
					<h3 className="w-4/5 font-main font-light text-xl text-(--primary-text) text-center mb-8">
						قم بإستعادة كلمة المرور الخاص بك لتصفح كل
						جديد
					</h3>
					<form
						onSubmit={handlingSubmit}
						className="w-full flex flex-col gap-4 mb-4"
					>
						<div className="w-full h-13 px-5 bg-(--tertiary-color)/25 rounded-20 flex items-center gap-2 border border-(--primary-color)/25 mb-3">
							<PiEnvelopeLight className="text-3xl text-(--secondary-text)" />
							<input
								type="text"
								name="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
								}}
								formNoValidate={false}
								placeholder="البريد الالكتروني"
								className="w-full h-full font-main font-medium text-lg placeholder:text-base bg-transparent text-(--primary-text) placeholder:text-(--secondary-text)/75 focus:outline-none"
							/>
						</div>
						<button
							ref={resetBtn}
							className="flex items-center justify-center gap-2 w-full h-13 bg-(--primary-color) font-main font-medium text-(--secondary-color) rounded-20 duration-300 hover:scale-95 cursor-pointer"
						>
							{!isLoading ? (
								<>
									<PiCaretRight className="text-2xl" />
									<span className="font-main text-base font-medium capitalize">
										إستعادة كلمة المرور
									</span>
								</>
							) : (
								<Spinner className="size-5" />
							)}
						</button>
					</form>
					<div className="w-full flex justify-center">
						<span className="font-main text-(--primary-text) text-base font-medium">
							هل لديك حساب بالفعل؟
							<Link to="/signin">
								<span className="text-(--primary-color) underline">
									تسجيل الدخول
								</span>
							</Link>
						</span>
					</div>
				</div>
			</div>
		</Main>
	);
}

export default ForgetPassword;
