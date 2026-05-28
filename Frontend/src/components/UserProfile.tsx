import { Link } from "react-router-dom";
import { 
    PiSignIn, 
	PiAppWindow,
	PiHeart
} 
from "react-icons/pi";
import { useProps } from "./PropsProvider";
import { 
	DropdownMenu, 
	DropdownMenuTrigger, 
	DropdownMenuContent,
	// DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator
} from "./ui/dropdown-menu";
import { 
	LogOutIcon,
	UserIcon,
	SettingsIcon,
	CreditCardIcon
} from 'lucide-react';
import { useSignout } from "@/api/hooks/auth/useSignout";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

function UserProfile() {
	const { data, mutate, error, isError, isSuccess } = useSignout();
	const { user } = useProps();

	const logout = () => {
		mutate();
	}

	useEffect(() => {
		if (isSuccess) {
			toast.success(data.data.message);
		}

		if (isError) {
			const axiosMeg = isAxiosError(error) ? error.response?.data?.message : "حدث شء ما خطأ";
			toast.error(axiosMeg);
		}
	}, [isSuccess, isError])

	return (
		<>
			{!user ? (
				<Link to={"/signin"}>
					<button className="flex items-center gap-2 px-6 h-13 rounded-20 border border-(--primary-color) bg-(--primary-color) text-(--secondary-color) cursor-pointer duration-300 hover:scale-95">
						<PiSignIn className="text-2xl" />
						<span className="font-main text-base font-medium capitalize">
							تسجيل الدخول{" "}
						</span>
					</button>
				</Link>
			) : (
				<div className="flex items-center gap-2">
					<div className="w-12 h-12 flex items-center justify-center border border-(--primary-color) rounded-full text-(--primary-color) cursor-pointer duration-300 ease-in-out hover:scale-90">
						<PiHeart className="text-2xl" />
					</div>
					<DropdownMenu dir="rtl">
						<DropdownMenuTrigger asChild>
							<div className="w-12 h-12 rounded-full border border-(--primary-color) overflow-hidden cursor-pointer duration-300 ease-in-out hover:scale-90">
								<img
									src={user.picture}
									alt="picture"
									className="w-100 object-cover"
								/>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent  className="font-main w-56 bg-(--secondary-color)" align="end">
							<DropdownMenuGroup>
								<Link to={{ pathname: `/profile/${user.username}` }}>
									<DropdownMenuItem className="font-main text-base font-light px-3 py-2 hover:bg-(--primary-color)/10 cursor-pointer">
										<UserIcon className="text-(--secondary-text)"/>
										الملف الشخصي
									</DropdownMenuItem>
								</Link>
								<Link to={{ pathname: `/dashboard` }}>
									<DropdownMenuItem className="font-main text-base font-light px-3 py-2 hover:bg-(--primary-color)/10 cursor-pointer">
										<PiAppWindow className="text-(--secondary-text)"/>
										وحدة التحكم
									</DropdownMenuItem>
								</Link>
								<DropdownMenuItem className="font-main text-base font-light px-3 py-2 hover:bg-(--primary-color)/10 cursor-pointer">
									<CreditCardIcon className="text-(--secondary-text)"/>
									الفواتير
								</DropdownMenuItem>
								<DropdownMenuItem className="font-main text-base font-light px-3 py-2 hover:bg-(--primary-color)/10 cursor-pointer">
									<SettingsIcon className="text-(--secondary-text)"/>
									الإعدادت
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={logout} className="font-main text-base font-light px-3 py-2 hover:bg-(--primary-color)/10 cursor-pointer">
								<LogOutIcon className="text-(--secondary-text)"/>
								تسجيل الخروج
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</>
	);
}

export default UserProfile;
