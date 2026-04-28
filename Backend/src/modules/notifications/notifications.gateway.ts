import { 
    WebSocketGateway, 
    WebSocketServer,
    OnGatewayConnection
} from '@nestjs/websockets';
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection {
    @WebSocketServer()
    private static server: Server;

    private static users = new Map<string, string>();

    handleConnection(socket: Socket) {
        const userId = socket.handshake.query.userId as string;

        if (userId) {
            NotificationGateway.users.set(userId, socket.id);
        }
    }

    static sendToUser(userId: string, notification: any) {
        const socketId = this.users.get(userId);

        if (socketId) {
            this.server.to(socketId).emit("notification", notification);
        }
    }
}