import { useLogout } from "@/api/hooks/user/useLogout";
import { useEffect } from "react";
import {
    PiSidebar,
    PiSignOut,
} from "react-icons/pi";
import { useNotification } from "@/components/NotificationContext";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useProps } from "@/components/PropsProvider";
import HasAccess from "@/components/HasAccess";
import { sidebarItems } from "@/shared/data/data";
import { Link } from "react-router-dom";

function DashSidebar({ closeSidebar, setCloseSidebar }: { closeSidebar: boolean, setCloseSidebar: (v: boolean) => void }) {    

    const { setUser } = useProps();
    const { mutate, error, isError, isSuccess } = useLogout();
    const { addNotification } = useNotification();
    const { t } = useTranslation();

    const handleLogout = async () => {
        mutate();
    }

    useEffect(() => {
        if (isError) {
            const axiosMsg = isAxiosError(error)? error.response?.data?.message : "حدث خطأ ما";
            addNotification(
                t(axiosMsg),
                "error",
                5000
            );
        }

        if (isSuccess)
            setUser(null);
    }, [error, isError, isSuccess]);

    return (
        <section className={`relative ${closeSidebar? "w-0" : "w-1/5"} h-full duration-300 bg-(--sidebar-color)/50`}>
            <div onClick={() => setCloseSidebar(!closeSidebar)} className="absolute top-5 -left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-(--primary-color) cursor-pointer text-(--tertiary-color) duration-300 hover:scale-95">
                <PiSidebar className="text-xl"/>
            </div>
            <div className="w-full h-full overflow-hidden">
                <div className="w-full h-full flex flex-col items-start p-5 gap-3">
                    <div className="w-full flex items-start border-b border-(--secondary-text) pb-2">
                        <img src="/logo.svg" alt="logo" className="w-22"/>
                    </div>
                    <div className="w-full h-full flex flex-col justify-between">
                        <ul className="w-full flex flex-col gap-2">
                            {
                                sidebarItems.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <HasAccess key={idx} role={item.hasAccess}>
                                            <Link to={{ pathname: item.path }}>
                                                <li key={`sidebar-item-${idx}`} className="group w-full h-12 px-4 flex items-center gap-3 rounded-10 bg-(--primary-color)/4 duration-300 hover:bg-(--primary-color) cursor-pointer">
                                                    <Icon className="group-hover:text-(--secondary-color) text-xl text-(--primary-color)"/>
                                                    <span className="font-main text-base text-(--primary-color) group-hover:text-(--secondary-color) capitalize whitespace-nowrap">{ item.name }</span>
                                                </li>
                                            </Link>
                                        </HasAccess>
                                    )
                                })
                            }
                        </ul>
                        <div onClick={handleLogout} className="group w-full h-12 px-4 flex items-center gap-3 rounded-10 bg-(--primary-color)/8 duration-300 hover:bg-(--primary-color) cursor-pointer">
                            <PiSignOut className="group-hover:text-(--secondary-color) text-xl text-(--primary-color)"/>
                            <span className="font-main text-base text-(--primary-color) group-hover:text-(--secondary-color) capitalize">تسجيل الخروج</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};

export default DashSidebar;