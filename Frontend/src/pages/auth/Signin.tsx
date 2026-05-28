import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { SigninForm } from "@/shared/interfaces/Interfaces";
import { PiEnvelopeLight, PiLockLight, PiSignIn } from "react-icons/pi";
import { useSignin } from "@/api/hooks/auth/useSignin";
// External Library
// import { isAxiosError } from "axios";
import Main from "@/components/Main";
import toast from "react-hot-toast";
import ErrorToastContent from "@/components/ui/ErrorToastContent";
// Validation schemas
import { signinSchema } from "@/shared/validation/schemas";

function Signin() {
	const { mutate } = useSignin();
	const [form, setForm] = useState<SigninForm>({
		email: "",
		password: "",
	});

	const submitHandling = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await signinSchema.validate(form, { abortEarly: false });
			mutate(form);
		} catch (err) {
			toast.error(<ErrorToastContent message={err.errors} />);
		} finally {
			setForm({
				email: "",
				password: "",
			});
		}
	};

	return (
		<Main auth>
			<section>
				<div className="container mx-auto min-h-screen flex items-center justify-center">
					<div className="w-120 flex flex-col items-center p-6 bg-(--secondary-color) shadow-2xl shadow-black/10 rounded-3xl mt-20">
						<h2 className="font-main font-semibold text-3xl text-(--primary-text) text-center mb-2 capitalize">
							تسجيل الدخول
						</h2>
						<h3 className="w-4/5 font-main font-light text-xl text-(--primary-text) text-center mb-8">
							قم بتسجيل الدخول إلي حسابك الخاص بك
							لتصفح كل جديد
						</h3>
						<form
							onSubmit={submitHandling}
							className="w-full flex flex-col gap-4 mb-4"
						>
							<div className="w-full h-13 px-5 bg-(--tertiary-color)/25 rounded-20 flex items-center gap-2 border border-(--primary-color)/25">
								<PiEnvelopeLight className="text-3xl text-(--secondary-text)" />
								<input
									type="text"
									onChange={(v) =>
										setForm({
											...form,
											[v.target
												.name]:
												v.target
													.value,
										})
									}
									name="email"
									value={form.email}
									formNoValidate={false}
									placeholder="البريد الالكتروني"
									className="w-full h-full font-main font-medium text-lg placeholder:text-base bg-transparent text-(--primary-text) placeholder:text-(--secondary-text)/75 focus:outline-none"
								/>
							</div>
							<div className="w-full h-13 px-5 bg-(--tertiary-color)/25 rounded-20 flex items-center gap-2 mb-3 border border-(--primary-color)/25">
								<PiLockLight className="text-3xl text-(--secondary-text)" />
								<input
									type="password"
									onChange={(v) =>
										setForm({
											...form,
											[v.target
												.name]:
												v.target
													.value,
										})
									}
									name="password"
									value={form.password}
									placeholder="كلمة المرور"
									className="w-full h-full font-main font-medium text-lg placeholder:text-base bg-transparent text-(--primary-text) placeholder:text-(--secondary-text)/75 focus:outline-none"
								/>
							</div>
							<button className="flex items-center justify-center gap-2 w-full h-13 bg-(--primary-color) font-main font-medium text-(--secondary-color) rounded-20 duration-300 hover:scale-95 cursor-pointer">
								<PiSignIn className="text-2xl" />
								<span className="font-main text-base font-medium capitalize">
									تسجيل الدخول
								</span>
							</button>
						</form>
						<div className="w-full flex justify-between">
							<span className="font-main text-(--primary-text) text-base font-medium">
								قم{" "}
								<Link to={"/account"}>
									<span className="text-(--primary-color) underline">
										بإنشاء حساب
									</span>
								</Link>{" "}
								شخصي جديد
							</span>
							<Link to={"/forgetpassword"}>
								<span className="font-main text-(--primary-color) text-base font-medium underline">
									إعادة تعين كلمة المرور
								</span>
							</Link>
						</div>
						<div className="w-full flex items-center justify-between mt-2 mb-3">
							<span className="inline-block w-1/2 h-0.5 bg-(--grey-color) rounded-full"></span>
							<span className="font-main text-lg font-medium px-4">
								أو
							</span>
							<span className="inline-block w-1/2 h-0.5 bg-(--grey-color) rounded-full"></span>
						</div>
						<div className="w-full flex items-center justify-center gap-3">
							<button className="w-13 h-13 rounded-full flex items-center justify-center gap-2 border border-(--primary-text) duration-300 ease-in-out hover:scale-95 hover:bg-(--primary-color)/10 hover:border-(--primary-color) cursor-pointer">
								<img
									src="/assets/facebook.svg"
									alt="facebook icon"
									className="h-6"
								/>
							</button>
							<button className="w-13 h-13 rounded-full flex items-center justify-center gap-2 border border-(--primary-text) duration-300 ease-in-out hover:scale-95 hover:bg-(--primary-color)/10 hover:border-(--primary-color) cursor-pointer">
								<img
									src="/assets/google.svg"
									alt="facebook icon"
									className="h-6"
								/>
							</button>
							<button className="w-13 h-13 rounded-full flex items-center justify-center gap-2 border border-(--primary-text) duration-300 ease-in-out hover:scale-95 hover:bg-(--primary-color)/10 hover:border-(--primary-color) cursor-pointer">
								<img
									src="/assets/microsoft.svg"
									alt="facebook icon"
									className="h-5"
								/>
							</button>
						</div>
					</div>
				</div>
			</section>
		</Main>
	);
}

export default Signin;
