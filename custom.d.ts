import { Request } from 'express';
import { WebSocket } from 'ws';


export interface IRequestWithSession extends Request {
    sessionToken?: string;
    user: any;
    session?: any;
    userId?: number;
    ws: WebSocket; // Add the 'ws' property of type 'WebSocket'
}