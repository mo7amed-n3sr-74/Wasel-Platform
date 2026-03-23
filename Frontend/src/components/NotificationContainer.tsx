// import { Alert } from "./Alert";
import type React from 'react';
import NotificationItem from './NotificationItem';
import type { Notification } from './NotificationContext';

interface Props {
    notifications: Notification[],
    onRemove: (id: string) => void
}

const NotificationContainer: React.FC<Props> = ({ notifications, onRemove }) => {
    return (
        <div className={`${notifications.length > 0? "flex": "hidden" } w-90 max-h-screen fixed top-0 right-0 flex-col gap-3 p-5 overflow-hidden z-20`}> 
            {
                notifications?.map((notification, idx) => {
                    return <NotificationItem key={idx} notification={notification} onClose={() => onRemove(notification.id)}/>
                })
            }
        </div>
    )
};

export default NotificationContainer;