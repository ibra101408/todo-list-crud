import { Request } from 'express';
import { WebSocket } from 'ws';


export interface IRequestWithSession extends Request {
    sessionToken?: string;
    user?: any;
   // err?: any;
    session?: any;
    isGoogleUser?: boolean;
    logout?: any;
    userId?: number;
    ws: WebSocket; // Add the 'ws' property of type 'WebSocket'
}