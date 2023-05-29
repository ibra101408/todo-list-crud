import { Request } from 'express';

export interface IRequestWithSession extends Request {
    sessionToken?: string;
    userId?: number;
}