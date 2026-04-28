import { notificationsQueue } from "./notification.queue";

export class NotificationsService {

    async sendNotification(data: {
        profile: string,
        title: string,
        message: string
    }) {
        await notificationsQueue.add("notify-user", data, {
            attempts: 3
        });
    }

}
