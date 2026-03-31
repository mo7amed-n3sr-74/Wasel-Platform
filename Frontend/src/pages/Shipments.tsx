import {
    PiFaders,
    // PiCaretDownFill, 
    PiSquaresFourFill,
    PiRowsFill,
    PiMagnifyingGlass,
} from 'react-icons/pi';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProps } from "@/components/PropsProvider";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Main from '@/components/Main';
import Loader from '@/components/Loader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { 
//     DropdownMenu, 
//     DropdownMenuTrigger, 
//     DropdownMenuContent, 
//     DropdownMenuGroup, 
//     // DropdownMenuItem,
//     DropdownMenuCheckboxItem
// } from '@/components/ui/dropdown-menu';
import { useShipments } from '@/api/hooks/shipments/useShipments';
import { useNotification } from '@/components/NotificationContext';
import ShipmentCard from '@/components/ShipmentCard';
import type { Shipment, ShipmentFilter } from '@/shared/interfaces/Interfaces';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import PageTitle from '@/components/PageTitle';
import { shipmentTypesFilter } from '@/shared/data/data';

function Shipments() {

    const { 
        user,
    } = useProps();
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    
    // DropdownMenuCheckboxs' states
    // const [showLatest, setShowLatest] = useState(true);
    // const [showOldest, setShowOldest] = useState(false);
    const [ query, setQuery ] = useState<ShipmentFilter>({
        search: "",
        type: "",
        urgent: false,
        minWeight: undefined,
        maxWeight: undefined,
    })

    const { data, isLoading, isError, error } = useShipments(query);
    const shipments = data?.data.shipments || [];  

    useEffect(() => {
        // Error case
        if (isError) {
            const axiosMsg = axios.isAxiosError(error)? error.response?.data.message: "حدث خطأ ما";
            addNotification(
                t(axiosMsg),
                "error",
                5000
            );
        }
    }, [isError, error])

    return (
        <Main>
            <section className="container mx-auto px-4 sm:px-0 min-h-screen pt-28 mb-24">
                <div className="flex items-center justify-between">
                    <PageTitle 
                        title='الحمولات المتاحة'
                        subTitle='تصفح الحمولات المتاحة أو قم بتقديم عروضك لنقلها بأمان وسرعة'
                    />
                    <Link to={"/newShipment"} className={user && user.role === 'MANUFACTURER'? 'block': 'hidden' }>
                        <Button size={"xl"} className="px-8">
                            إضافة حمولة
                        </Button>
                    </Link>
                </div>
                <div className="w-full h-full grid grid-cols-12 gap-5">
                    <div className="col-span-3">
                        <div className="w-full flex flex-col gap-6 p-5 rounded-2xl bg-(--secondary-color)">
                            <div className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-1 text-(--primary-text)">
                                    <PiFaders className="text-3xl"/>
                                    <h3 className="font-main text-2xl font-semibold">تصنيف</h3>
                                </div>
                                <h4 className="font-main text-base font-medium text-(--blue-color) hover:underline cursor-pointer">مسح الكل</h4>
                            </div>

                            <div className="flex flex-col">
                                <h4 className="font-main text-xl font-medium text-(--primary-text) mb-3">نوع الحمولة</h4>
                                <div className="flex flex-col gap-3">
                                    {
                                        shipmentTypesFilter.map((type, idx) => {
                                            return (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <input type="radio" id={type} name='shipmentType' onChange={(e) => { setQuery({ ...query, type: e.target.value !== "الكل"? e.target.value : "" }) }} value={type} className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"/>
                                                    <label htmlFor={type} className="font-main text-lg font-medium text-(--secondary-text)">{ type }</label>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h4 className="font-main text-xl font-medium text-(--primary-text) mb-3">الوزن</h4>
                                <div className="flex items-center gap-3">
                                    <input type="text" onChange={(e) => setQuery({ ...query, [e.target.name]: Number(e.target.value)? e.target.value : "" })} name='minWeight' placeholder="من" className="w-1/2 py-2 px-4 rounded-lg text-lg placeholder:text-(--secondary-text)/50 border border-(--secondary-text)"/>
                                    <span className="text-3xl text-(--primary-text)">-</span>
                                    <input type="text" onChange={(e) => setQuery({ ...query, [e.target.name]: Number(e.target.value)? e.target.value : "" })} name='maxWeight' placeholder="إلي" className="w-1/2 py-2 px-4 rounded-lg text-lg placeholder:text-(--secondary-text)/50 border border-(--secondary-text)"/>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h4 className="font-main text-xl font-medium text-(--primary-text) mb-3">الحالة</h4>
                                <div className="flex items-center justify-between gap-3">
                                    <label htmlFor='urgent-btn' className="font-main text-lg font-medium text-(--secondary-text)">حمولة عاجلة</label>
                                    <Switch dir='ltr' id='urgent-btn' size='default' onCheckedChange={() => { setQuery({ ...query, urgent: !query.urgent }) }}></Switch>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full col-span-9">
                        <div className='h-full flex flex-col p-5 rounded-2xl bg-(--secondary-color)'>
                            <div className="w-full flex items-center justify-between mb-6 gap-6">
                                <h3 className="font-main text-lg font-normal text-(--tertiary-color) text-nowrap"><span className='text-(--primary-color)'>{ data?.data.total }</span> حمولة متاحة</h3>
                                <div className="h-12 w-full flex items-center gap-1 px-3 bg-[#7D807F]/10 border border-(--primary-color)/25 rounded-lg">
                                    <PiMagnifyingGlass className="text-3xl text-(--primary-color)" />
                                    <input type="text" onChange={(e) => setQuery((prev) => {
                                        return {
                                            ...prev,
                                            [e.target.name]: e.target.value
                                        }
                                    })} name='search' className="h-12 w-full font-main text-base focus:outline-none placeholder:font-light placeholder:text-sm" placeholder="ابحث عن حمولتك بمكان الوصول أو الانطلاق" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-26 h-12 flex items-center gap-2 px-2 py-1.5 bg-[#7D807F]/10 border border-(--primary-color)/25 rounded-lg">
                                        <Tooltip>
                                            <TooltipTrigger className='w-1/2 h-full'>
                                                <div className="w-full h-full flex items-center justify-center bg-(--secondary-text)/10 rounded-sm cursor-pointer duration-300 hover:scale-95">
                                                    <PiSquaresFourFill className="text-2xl text-(--primary-color)" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className='font-main'>{ t("card view") }</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger className='w-1/2 h-full'>
                                                <div className="w-full h-full flex items-center justify-center bg-(--secondary-text)/10 rounded-sm cursor-pointer duration-300 hover:scale-95">
                                                    <PiRowsFill className="text-2xl text-(--primary-color)" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className='font-main'>{ t("rows view") }</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <div className={`w-full relative ${isLoading || !shipments.length? "h-full flex items-center justify-center": "grid grid-cols-12 gap-3"}`}>
                                {
                                    isLoading?
                                        <Loader />
                                    :
                                        shipments.length > 0?
                                            shipments.map((shipment: Shipment, idx: number) => {
                                                return (
                                                    <ShipmentCard key={idx} shipment={shipment}/>
                                                )
                                            })
                                        :
                                            <div className="col-span-12 w-full h-full flex items-center justify-center">
                                                <h3 className='font-main text-2xl text-(--primary-color) capitalize'>No shipments found</h3>
                                            </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Main>
    )
};

export default Shipments;