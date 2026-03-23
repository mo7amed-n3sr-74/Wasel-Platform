import {
    PiInfo,
    PiCheckCircle,
    PiWarningCircle,
    PiXCircle,
} from 'react-icons/pi';
import type { Notification } from './NotificationContext';

interface Props {
    notification: Notification,
    onClose: () => void
}

function NotificationItem({ notification, onClose }: Props) { 
    const { message, type } = notification;

    const notifyCustmization = {
        success: {
            border: 'border-b-2 border-(--green-color)',
            iconStyle: 'text-(--green-color)',
            icon: <PiCheckCircle />,
        },
        error: {
            border: 'border-b-2 border-(--red-color)',
            iconStyle: 'text-(--red-color)',
            icon: <PiXCircle />
        },
        warning: {
            border: 'border-b-2 border-(--yellow-color)',
            iconStyle: 'text-(--yellow-color)',
            icon: <PiWarningCircle />,
        },
        info: {
            border: 'border-b-2 border-(--blue-color)',
            iconStyle: 'text-(--blue-color)',
            icon: <PiInfo />
        }
    }

    return (
    <div onClick={onClose} className={`${notifyCustmization[type].border} relative w-full flex items-start justify-between -right-full rounded-sm p-3 gap-2 bg-(--secondary-color) shadow-sm shadow-balck/25 notify-animate duration-200 hover:scale-95 cursor-pointer`}>
            <div className="flex items-start gap-1">
                <div className={`${notifyCustmization[type].iconStyle} flex items-center justify-center rounded-full`}>
                    <span className='text-2xl'>
                        { notifyCustmization[type].icon }
                    </span>
                </div>
                <h3 className="font-main text-base font-light text-(--secondary-text)">{ message }</h3>
            </div>
        </div>
    )
}

export default NotificationItem;