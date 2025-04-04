import {NextFunction, Response, Request} from 'express';
const express = require('express');
const app = express();
import * as https from 'https';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import WebSocket from 'ws';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

let httpsServer = https
    .createServer(
        // Provide the private and public key to the server by reading each
        // file's content with the readFileSync() method.
        {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem"),
        },
        app
    )

    .listen(8080, () => {
        console.log(`Server running at https://localhost:8080. Documentation at https://localhost:8080/docs`)
    });

const expressWs = require('express-ws')(app, httpsServer);

app.ws('/', function () {

});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

require('dotenv').config();

//dotenv.config();

import * as swaggerUi from 'swagger-ui-express';
import * as yamljs from 'yamljs';
import * as path from "path";
import * as bcrypt from 'bcrypt'
import { IRequestWithSession } from './custom'
import xmlparser from 'express-xml-bodyparser';

//app.use(xmlparser());
app.use(xmlparser({ explicitArray: false }));
app.use(cookieParser());
app.use(express.json());

// Add Swagger
const swaggerDocument = yamljs.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/config', (req: Request, res: Response) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

export interface PostUserRequest extends Request {
    email: string,
    password: string
}

interface PostUserResponse extends Response {}

export interface PostSessionRequest extends Request {
    email: string,
    password: string
}

export interface DeleteSessionResponse extends Response {}

export interface PostSessionResponse extends Response {
    sessionToken: string;
    isGoogleUser: boolean;
}

import logger from './logger';
app.set('view engine', 'ejs');

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {

    next();
});

const filePath = path.join(__dirname, 'file.log');

// Function to parse the log data into log objects
function parseLogs(data: any) {
    const logLines = data.split('\n');
    const filteredLines = logLines.filter((line: any) => line.trim().length > 0);
    return filteredLines.map((line: any) => JSON.parse(line));
}

//const logEntries = fs.readFileSync(filePath, 'utf-8').split('\n');
const logEntries = fs.readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map(entry => entry.trim())
    .filter(entry => entry !== "");

let filteredLogs = logEntries
    .map(entry => {
        try {
            return JSON.parse(entry);
        } catch (error) {
            console.error('Error parsing log entry:', entry);
            return null;
        }
    })
    .filter(log => log !== null); // Filter out any entries that couldn't be parsed

fs.watch(filePath, handleFileChange);

function sendLogsToClients(logs: any[]): void {
    const payload = JSON.stringify(logs);
    expressWs.getWss().clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

function handleFileChange() {
    // Read the updated log file
    const updatedLogs = fs.readFileSync(filePath, 'utf-8');
    const parsedLogs = parseLogs(updatedLogs);
    filteredLogs = parsedLogs;

    // Send the updated logs to all connected clients
    sendLogsToClients(parsedLogs);
}

app.get('/logs', (req: Request, res: Response) => {
    res.json(filteredLogs);
});

// Add the request logger middleware
app.use(express.json());

//GOOGLE
app.post('/auth/google', async (req: PostUserRequest, res: PostUserResponse) => {

    const response: any = req.body;

    function decodeJwtResponse(response: any) {
        const jwtToken = response.credential;
        const payloadBase64 = jwtToken.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));

        return payload;
    }

    const credential = decodeJwtResponse(response);

    const user = await prisma.user.findUnique({
        where: {
            email: credential.email,
        },
    });

    if (!user) {
        await prisma.user.create({
            data: {
                email: credential.email,
            },
        });
        console.log("new User comes in");

        res.status(201).end();

    } else {
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expires: new Date(),
            },
        });
        // Save the session ID and send the response
        res.status(201).json({ sessionToken: session.sessionToken });
    }
    logger.info(`User logged in via Google: ${credential.email}`);

});

app.post('/users', async (req: PostUserRequest, res: PostUserResponse) => {

    try {
        if (req.headers['content-type'] === 'application/json') {
            // If the Content-Type is JSON, directly access req.body as JSON object
            const { email, password } = req.body;

            // Validate email and password
            if (!email || !password) {
                return res.status(400).send('Email and password required');
            }

            // Validate that email is unique
            const userExists = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (userExists) {
                return res.status(409).json('Email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const createdUser = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                },
            });
            logger.info(`User created. Email: ${email}`);
            // Return user
            return res.status(201).end();
        } else if (req.headers['content-type'] === 'application/xml') {
            // If the Content-Type is XML, parse the XML data
            parser.parseString(req.body.root, async (err: Error | null, result: any) => {
                const email = req.body.root.email[0];
                const password = req.body.root.password[0];
                if (err) {
                    console.log(Error);
                    console.log(req.body);
                    return res.status(400).send('Invalid XML format!');
                }
                const parser = new xml2js.Parser();

                let jsonData;

                parser.parseString(req.body, (err: Error, result: any) => {
                    jsonData = result;
                });

                // Validate email and password
                if (!email || !password) {
                    return res.status(400).send('Email and password required');
                }

                // Validate that email is unique
                const userExists = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (userExists) {
                    return res.status(409).json('Email already exists');
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create user
                const createdUser = await prisma.user.create({
                    data: {
                        email: email,
                        password: hashedPassword,
                    },
                });

                // Return user
                return res.status(201).end();
            });
        } else {
            return res.status(415).send('Unsupported Media Type');
        }
    } catch (error) {
        res.status(500).json('Error!');
    }

});

app.post('/sessions', async (req: PostSessionRequest, res: PostSessionResponse) => {

    // Validate email and password
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Email and password required')
    }

    // Validate that email exists
    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    })

    if (!user) {
        return res.status(401).send('Invalid email or password')
    }

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password as string);

    if (!validPassword) {
        return res.status(401).send('Invalid email or password1')
    }

    // Create session
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            expires: new Date(),
        }
    });

    // Return session
    res.status(201).json({
        sessionToken: session.sessionToken
    })
    logger.info(`User logged in. User email: ${user.email}`);

})


// Add authorization middleware

const authorizeRequest = async (req: IRequestWithSession, res: Response, next: NextFunction) => {
    // 1. First check for regular auth token
    const authHeader = req.headers.authorization;

    // 2. Check for guest cookie if no auth header
    if (!authHeader) {
        let guestId = req.cookies.guestId;

        // Generate new guest ID if none exists
        if (!guestId) {
            guestId = `guest-${Math.random().toString(36).substring(2, 11)}`;
            res.cookie('guestId', guestId, {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }

        req.userId = guestId;
        req.sessionToken = undefined;
        return next();
    }

    // 3. Handle authenticated users (existing logic)
    if (!authHeader.startsWith('Bearer') || authHeader.split(' ').length !== 2) {
        return res.status(401).send('Invalid authorization header format');
    }

    const sessionToken = authHeader.split(' ')[1];
    const session = await prisma.session.findUnique({
        where: { sessionToken },
        select: { userId: true }
    });

    if (!session?.userId) {
        return res.status(401).send('Invalid session token1');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    });

    if (!user) {
        return res.status(401).send('Invalid session token2');
    }

    req.userId = user.id;
    req.sessionToken = sessionToken;
    next();
};

app.delete('/sessions', async (req: IRequestWithSession, res: Response) => {
    try {
        // Handle authenticated users
        if (req.headers.authorization) {
            const sessionToken = req.headers.authorization.split(' ')[1];

            // Use deleteMany to avoid "record not found" errors
            await prisma.session.deleteMany({
                where: { sessionToken }
            });
        }

        // Clear guest cookie if exists
        res.clearCookie('guestId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(204).end();
    } catch (error) {
        console.error('Sign out error:', error);
        return res.status(500).send('Error during sign out');
    }
});

// Get items
app.get('/items', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    const isGuest = typeof req.userId === 'string' && req.userId.startsWith('guest-');

    const items = await prisma.item.findMany({
        where: {
            OR: [
                isGuest ? { guestId: req.userId as string } : { userId: req.userId as number },
                // Add other conditions if needed
            ]
        }
    });

    res.status(200).json(items)
});

app.post('/items', authorizeRequest, async (req: IRequestWithSession, res: Response) => {
    try {
        const { description } = req.body;
        const newDescription = String(description);
        const userId = req.userId;
        const isGuest = typeof req.userId === 'string' && req.userId.startsWith('guest-');

        if (!newDescription) {

            return res.status(400).send('Description required');
        }
        const newItem = await prisma.item.create({
            data: {
                description: newDescription,
                userId: isGuest ? null : (userId as number),  // Explicitly cast to number
                guestId: isGuest ? (userId as string) : null,  // Explicitly cast to string
            },
        });

        expressWs.getWss().clients.forEach((client: any) => client.send(JSON.stringify({
            type: 'create',
            item: newItem
        })));

        const responseObj = {
            description: newDescription
        };
        res.status(201).json(responseObj);

//        res.status(201).end();
    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
    logger.info(`New item added: ${req.body.description}`);
});

app.put('/items/:id', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    try {
        // Get id from req.params
        const { id } = req.params;
        const { description, completed } = req.body;

        if (!description) {
            return
        }

        const item = await prisma.item.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!item || (item.userId && item.userId !== req.userId) || (item.guestId && item.guestId !== req.userId)) {
            return res.status(404).send('Item not found');
        }

        const updatedItem = await prisma.item.update({
            where: {
                id: Number(id),
            },
            data: {
                description,
                completed: Boolean(completed),
            },

        });
        expressWs.getWss().clients.forEach(
            (client: any) =>
                client.send(JSON.stringify({
                    type: 'update',
                    id: updatedItem.id,
                    description: updatedItem.description,
                    completed: updatedItem.completed,
                }))
        );
        const response = {
            id: updatedItem.id,
            description: updatedItem.description,
            completed: updatedItem.completed
        };

        res.status(200).send(response);
        logger.info(`Item updated: ${req.body.description}, completed: ${String(req.body.completed)}`);

    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
});app.delete('/items/:id', authorizeRequest, async (req: IRequestWithSession, res: Response) => {
    try {
        const { id } = req.params;
        const isGuest = typeof req.userId === 'string' && req.userId.startsWith('guest-');

        const item = await prisma.item.findUnique({
            where: { id: Number(id) }
        });

        if (!item) {
            return res.status(404).send('Item not found');
        }

        // Check ownership
        const isOwner = isGuest
            ? item.guestId === req.userId
            : item.userId === req.userId;

        if (!isOwner) {
            return res.status(404).send('Item not found');
        }

        const deletedItem = await prisma.item.delete({
            where: { id: Number(id) }
        });

        // Fixed WebSocket broadcast with proper typing
        expressWs.getWss().clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'delete',
                    id: deletedItem.id
                }));
            }
        });

        logger.info(`Item deleted`);
        return res.status(204).end();

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).send('Internal server error');
    }
});

// Guest initialization endpoint
app.post('/api/guest-init', (req: IRequestWithSession, res: Response) => {
    const guestId = req.cookies?.guestId || `guest-${Math.random().toString(36).substring(2, 11)}`;;

    res.cookie('guestId', guestId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    res.status(200).send();
});

// Items endpoint (updated)
app.get('/api/items', authorizeRequest, async (req: IRequestWithSession, res: Response) => {
    const items = await prisma.item.findMany({
        where: {
            OR: [
                { guestId: typeof req.userId === 'string' ? req.userId : undefined },
                { userId: typeof req.userId === 'number' ? req.userId : undefined }
            ]
        }
    });
    res.json(items);
});

// Add this endpoint to your backend
app.post('/clear-guest', (req: IRequestWithSession, res: Response) => {
    // Clear the guestId cookie
    res.clearCookie('guestId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.status(200).send();
});

