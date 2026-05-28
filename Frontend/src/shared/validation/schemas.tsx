import * as yup from "yup";

export const signinSchema = yup.object({
	email: yup
		.string()
		.email("Invalid email format")
		.required("Email field is required"),
	password: yup.string().required("Password field is required"),
});

export const signupSchema = yup.object({
	username: yup.string().required("Username field is required"),
	email: yup
		.string()
		.email("Invalid email format")
		.required("Email field is required"),
	password: yup.string().required("Password field is required"),
	confirmPassword: yup
		.string()
		.required("Confirm password field is required"),
});

// Driver Schema
export const createDriverSchema = yup.object({
	first_name: yup
		.string()
		.required("الاسم الأول مطلوب")
		.min(2, "الاسم الأول يجب أن يكون على الأقل حرفين"),
	last_name: yup
		.string()
		.required("الاسم الأخير مطلوب")
		.min(2, "الاسم الأخير يجب أن يكون على الأقل حرفين"),
	age: yup
		.string()
		.required("العمر مطلوب")
		.matches(/^\d+$/, "العمر يجب أن يكون رقم صحيح")
		.test(
			"age-valid",
			"العمر يجب أن يكون بين 18 و 80",
			function (value) {
				const age = parseInt(value || "0", 10);
				return age >= 18 && age <= 80;
			},
		),
	national_id: yup
		.string()
		.required("رقم الهوية مطلوب")
		.matches(/^\d+$/, "رقم الهوية يجب أن يحتوي على أرقام فقط")
		.min(10, "رقم الهوية قصير جداً"),
	phone: yup
		.string()
		.required("رقم الهاتف مطلوب")
		.matches(/^[0-9+\-\s()]*$/, "رقم الهاتف غير صحيح")
		.min(10, "رقم الهاتف قصير جداً"),
	picture: yup.mixed().required("الصورة الشخصية مطلوبة"),
	license_front: yup.mixed().required("رخصة القيادة - أمامية مطلوبة"),
	license_back: yup.mixed().required("رخصة القيادة - خلفية مطلوبة"),
	national_id_card_front: yup
		.mixed()
		.required("بطاقة الهوية - أمامية مطلوبة"),
	national_id_card_back: yup
		.mixed()
		.required("بطاقة الهوية - خلفية مطلوبة"),
});
