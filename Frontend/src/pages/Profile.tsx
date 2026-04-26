import Main from "@/components/Main";
import { useProps } from "@/components/PropsProvider";
import {
    PiShareFat,
    PiInstagramLogo,
    PiFacebookLogo,
    PiXLogo,
    PiPencil
} from "react-icons/pi"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { profileTabs } from "@/shared/data/data";
import { useTranslation } from "react-i18next";

function Profile() {
    const { user } = useProps();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [ activeTab, setActiveTab ] = useState<string>("public_view");
    

    const isManufacturer = user?.role === "MANUFACTURER";
    const isIndependentCarrier = user?.role === "INDEPENDENT_CARRIER";
    const isCarrierCompany = user?.role === "CARRIER_COMPANY";

    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user])
    

    return (
        <Main>
            <section>
                <div className="container flex flex-col gap-6 mx-auto px-4 sm:px-0 min-h-screen pt-28 mb-24">
                    <div className="rounded-2xl bg-(--secondary-color) overflow-hidden border-2 border-(--tertiary-color)/50">
                        <div className="relative p-6 sm:px-8 sm:pb-8 sm:pt-20">
                            <div className="absolute inset-x-0 top-0 h-40 bg-(--bg-color)" />
                            <div className="flex flex-col items-start gap-4 relative">
                                <div className="h-40 w-40 rounded-full relative overflow-hidden border-2 border-(--bg-color)">
                                    <img
                                        src={user?.picture || "https://via.placeholder.com/220x220?text=Avatar"}
                                        alt="profile"
                                        className="w-full h-full rounded-full object-cover border-8 border-white"
                                    />
                                </div>

                                <div className="w-full pt-6 lg:pt-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-4xl sm:text-4xl font-semibold text-(--main-text)">{user?.first_name} {user?.last_name}</h1>
                                            { isManufacturer && (
                                                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5b400] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                                                    {/* <ShieldCheck className="w-4 h-4" /> */}
                                                    صاحب بضائع
                                                </div>
                                            ) }
                                            { isIndependentCarrier && (
                                                <div className="inline-flex items-center gap-2 rounded-full bg-(--green-color) px-4 py-2 text-sm font-semibold text-white shadow-sm">
                                                    {/* <ShieldCheck className="w-4 h-4" /> */}
                                                    سائق شاحنة
                                                </div>
                                            ) }
                                            { isCarrierCompany && (
                                                <div className="inline-flex items-center gap-2 rounded-full bg-(--grey-color) px-4 py-2 text-sm font-semibold text-white shadow-sm">
                                                    {/* <ShieldCheck className="w-4 h-4" /> */}
                                                    سائق شاحنة
                                                </div>
                                            ) }
                                        </div>
                                        <p className="mt-2 text-lg font-medium text-(--secondary-text)">
                                            {isManufacturer || isCarrierCompany && (user?.companyName || "شركة عامة") }
                                            {isIndependentCarrier && "سائق شاحنة" }
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="mt-6 flex items-center gap-3">
                                            <button className="inline-flex items-center gap-2 rounded-xl bg-(--primary-color) px-5 h-12 text-sm font-medium text-(--secondary-color) duration-300 hover:opacity-90">
                                                <PiPencil className="w-4 h-4" />
                                                قم بتوثيق حسابك
                                            </button>
                                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-(--primary-color) text-(--primary-color) duration-300 hover:bg-(--primary-color) hover:text-(--secondary-color)">
                                                {/* <Truck className="w-5 h-5" /> */}
                                                <PiShareFat className="w-5 h-5"/>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center gap-3">
                                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-(--primary-color) text-(--primary-color) duration-300 hover:bg-(--primary-color) hover:text-(--secondary-color)">
                                                <PiInstagramLogo className="w-5 h-5"/>
                                            </div>
                                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-(--primary-color) text-(--primary-color) duration-300 hover:bg-(--primary-color) hover:text-(--secondary-color)">
                                                <PiFacebookLogo className="w-5 h-5"/>
                                            </div>
                                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-(--primary-color) text-(--primary-color) duration-300 hover:bg-(--primary-color) hover:text-(--secondary-color)">
                                                <PiXLogo className="w-5 h-5"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-(--secondary-color) overflow-hidden border-2 border-(--tertiary-color)/50">
                        <div className="relative flex items-center mb-6 before:content before:absolute before:bottom-1 before:left-0 before:h-0.5 before:w-full before:bg-linear-to-r before:from-transparent before:via-(--primary-color) before:to-transparent">
                            {
                                profileTabs.map((tab, idx) => {
                                    return (
                                        <div key={`profile-tab-${idx}`} onClick={() => setActiveTab(tab.key)} className={`${activeTab === tab.key? "text-(--secondary-color) bg-(--primary-color)" : "text-(--primary-text)"} py-4 px-5 duration-300 ease-in-out hover:text-(--secondary-color) hover:bg-(--primary-color) text-xl cursor-pointer`}>
                                            <span>{ t(tab.title) }</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {
                            profileTabs.map((tab) => {
                                const Tab = tab.component;
                                return ( tab.key === activeTab && <Tab />)
                            })
                        }
                    </div>
                </div>
            </section>
        </Main>
    );
}

export default Profile;
