import { Worker } from "bullmq";
import { NotificationGateway } from "./notifications.gateway";
import { PrismaService } from "@/database/prisma/prisma.service";

const prisma  = new PrismaService();
const worker = new Worker(
    "notifications",
    async job => {
        const { profileId, title, message } = job.data;

        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                isRead: false,
                profile: {
                    connect: {
                        id: profileId
                    }
                }
            }
        });

        NotificationGateway.sendToUser(profileId, notification);
    }, {
        connection: {
            url: process.env.REDIS_URL
        }
    }
)