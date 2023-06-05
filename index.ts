import { NextFunction, Response, Request } from 'express';
const express = require('express');
const app = express();
import * as https from 'https';
import * as fs from 'fs';

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
        console.log("Server is running at port 8080 ");
    });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import * as dotenv from 'dotenv';
dotenv.config();

import * as swaggerUi from 'swagger-ui-express';
import * as yamljs from 'yamljs';
import * as path from "path";
import * as bcrypt from 'bcrypt'
import { IRequestWithSession } from './custom'

app.use(express.json());

// Add Swagger
const swaggerDocument = yamljs.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set port
const port = process.env.PORT || 8080;

export interface PostUserRequest extends Request {
    email: string,
    password: string
}

interface PostUserResponse extends Response {
}

export interface PostSessionRequest extends Request {
    email: string,
    password: string
}

export interface DeleteSessionResponse extends Response {
}

export interface PostSessionResponse extends Response {
    sessionToken: string
}

///TODOS
app.get('/todos', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'todos.html'));
});

app.post('/todos', (req: Request, res: Response) => {
    console.log('In the sign Up');
    // Handle the sign-up logic here
});

///SIGN IN
app.get('/signin', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signin.html'));
});
// Define a route for sign-in
app.post('/signin', (req: Request, res: Response) => {

    const { email, password } = req.body;

    if (email === 'user' && password === 'user') {
        res.status(200).json({ message: 'Sign in successful' });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

////SIGN UP
app.get('/signup', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signup.html'));
});

app.post('/signup', (req: Request, res: Response) => {
    console.log('In the sign Up');
    // Handle the sign-up logic here
});

app.post('/users', async (req: PostUserRequest, res: PostUserResponse) => {
    // Validate email and password
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Email and password required');
    }

    // Validate that email is unique
    const userExists = await prisma.user.findUnique({
        where: {
            email: req.body.email,
        },
    });

    if (userExists) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user
    await prisma.user.create({
        data: {
            email: req.body.email,
            password: hashedPassword,
        },
    });

    // Return user
    res.status(201).end();
});

            //Sessions//
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
        return res.status(401).send('Invalid email or password')
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
})

// Add authorization middleware
const authorizeRequest = async (req: IRequestWithSession, res: Response, next: NextFunction) => {

    // Validate session
    if (!req.headers.authorization) {
        return res.status(401).send('Authorization header required')
    }

    // Validate extract session format
    if (!req.headers.authorization.startsWith('Bearer') || req.headers.authorization.split(' ').length !== 2) {
        return res.status(401).send('Invalid authorization header format')
    }

    // Extract sessionToken
    const sessionToken = req.headers.authorization.split(' ')[1]

    const session = await prisma.session.findUnique({
        where: {
            sessionToken: sessionToken
        }
    })

    if (!session) {
        return res.status(401).send('Invalid session token (!session)')
    }

    // Add user to request
    let user = await prisma.user.findUnique({
        where: {
            id: session.userId
        }
    })

    // Validate user
    if (!user) {
        return res.status(401).send('Invalid session token (!user)')
    }

    // Add session to request
    req.userId = user.id
    req.sessionToken = sessionToken

    next()
}
app.delete('/sessions', authorizeRequest, async (req: IRequestWithSession, res:DeleteSessionResponse) => {
    try {
        // Delete session
        await prisma.session.delete({
            where: {
                sessionToken: req.sessionToken
            }
        });

        // Return success response
        res.status(204).end();
    } catch (error) {
        // Return error response
        res.status(500).json({ error: 'Failed to sign out' });
    }
});

// Get items
app.get('/items', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    // Get items for the signed-in user
    const items = await prisma.item.findMany({
        where: {
            userId: req.userId
        }
    })

    // Return items
    res.status(200).json(items)
})

app.post('/items', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    try {
        const { description } = req.body;
        const newDescription = String(description);
        const userId = req.userId;

        if (userId === undefined) {
            throw new Error('User ID is not defined');
        }

        if (!newDescription) {
            return res.status(400).send('Description required');
        }

        const newItem = await prisma.item.create({
            data: {
                description: newDescription,
                userId
            },
        });

        res.status(201).json(newItem);
    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
});

app.delete('/items/:id', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    try {
        const { id } = req.params;

        const item = await prisma.item.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!item || item.userId !== req.userId) {
            return res.status(404).send('Item not found');
        }

        const deletedItem = await prisma.item.delete({
            where: {
                id: Number(id),
            },
        });

        res.status(204).json(deletedItem);
    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
});

