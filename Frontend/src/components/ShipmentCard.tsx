import ImagesCarousel from "./ImagesCarousel"
import { 
    PiUser,
    PiClock,
} from "react-icons/pi"
import { Link } from "react-router-dom"
import type { Shipment } from "@/shared/interfaces/Interfaces"
import dayjs from "dayjs"

function ShipmentCard({ shipment }: { shipment: Shipment }) {
    return (
        <div className="col-span-6 xxl:col-span-4 flex flex-col justify-between rounded-20 p-3 shadow-lg shadow-black/10 bg-[#F7F8FA] border border-(--primary-color)/25">
            <div className="h-42 rounded-10 overflow-hidden">
                {
                    shipment.attachments && (
                        <ImagesCarousel>
                            {
                                shipment.attachments.map((file) => {
                                    if (file.attachmentType === 'Image') {
                                        return <img src={file.url} alt='image' className='w-full h-full object-cover'></img>
                                    }
                                })
                            }
                        </ImagesCarousel>
                    )
                }
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                    <PiUser className="text-xl text-(--primary-text)"/>
                    <Link to={{ pathname: '/' }}>
                        <h4 className="font-main font-mediumm text-base text-(--secondry-text) duration-300 hover:underline hover:text-(--primary-color)">{ shipment.profile?.first_name } { shipment.profile?.last_name }</h4>
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    <PiClock className="text-xl text-(--primary-text)"/>
                    <h4 className="font-main font-mediumm text-base text-(--secondry-text)">منذ 5 دقايق</h4>
                </div>
            </div>

            <div className="flex items-center justify-evenly gap-3 my-2">
                <div className="flex flex-col items-center justify-center">
                    <h4 className="font-main font-medium text-xl text-(--primary-text)">{ shipment.origin.split("-")[0].split(" ")[0] }</h4>
                    <h5 className="font-main font-medium text-base text-(--secondary-text)/75">
                        { dayjs(shipment.pickupAt).format("DD MMM") }
                    </h5>
                </div>
                <img src="/arrow.svg" alt="icon" className="mt-2.5 h-4"/>
                <div className="flex flex-col items-center justify-center">
                    <h4 className="font-main font-medium text-xl text-(--primary-text)">{ shipment.destination.split("-")[0].split(" ")[0] }</h4>
                    <h5 className="font-main font-medium text-base text-(--secondary-text)/75">
                        { dayjs(shipment.deliveryAt).format("DD MMM") }
                    </h5>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
                { shipment.budgetType !== 'OPEN_BUDGET' && (
                    <h4 className="font-main text-sm font-medium text-(--primary-text) text-nowrap"> السعر المقترح: <span className="font-bold text-lg text-(--primary-color)">{ shipment.suggestedBudget }</span> ج</h4>
                ) }
                {/* <h4 className="font-main text-sm font-medium text-(--primary-text) text-nowrap">أقل عرض: <span className="font-bold text-lg text-(--green-color)">2200</span> ج</h4> */}
            </div>

            <h6 className="font-main font-medium text-sm text-(--primary-text) mb-4"><span className="font-semibold text-(--primary-color)">{ shipment.offerCount }</span> عرض حتي الآن</h6>


            <div className="flex items-center gap-2">
                <Link to={{ pathname: `/shipments/${shipment.id}` }}>
                    <button className="h-12 px-5 flex items-center gap-2 rounded-20 bg-(--primary-color) text-(--secondary-color) duration-300 hover:scale-95 cursor-pointer">
                        <span className="font-main font-light text-base capitalize">
                            عرض المزيد
                        </span>
                    </button>
                </Link>
                {/* <button className="w-12 h-12 flex items-center justify-center rounded-full border border-(--primary-color) text-(--primary-color) duration-300 hover:scale-95 hover:bg-(--primary-color) hover:text-(--secondary-color) cursor-pointer">
                    <PiMapPinArea className="text-2xl"/>
                </button> */}
            </div>
        </div>
    )
}

export default ShipmentCard;