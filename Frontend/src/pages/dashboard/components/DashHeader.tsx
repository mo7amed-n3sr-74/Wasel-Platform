import {
    PiBell
} from "react-icons/pi";
import { useProps } from "@/components/PropsProvider";
import { useTranslation } from "react-i18next";

function DashHeader({ title }: { title: string }) {

    const { user } = useProps();
    const { t } = useTranslation();

    if (!user) return;
    return (
        <header>
            <div className="flex items-center justify-between mb-4">
                <h1 className="font-main text-3xl text-(--primary-text) capitalize">{ t(title) }</h1>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center border border-(--primary-color) rounded-full text-xl text-(--primary-color) duration-300 hover:text-(--secondary-color) hover:bg-(--primary-color) cursor-pointer">
                        <PiBell/>
                    </div>
                    <div className="w-10 h-10 overflow-hidden rounded-full border border-(--primary-color)">
                        <img src={user.picture} alt="picture" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    )
};

export default DashHeader;