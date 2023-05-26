import express, { NextFunction, Request, Response } from 'express'

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express';
import yamljs from 'yamljs';
import * as path from "path";
import * as bcrypt from 'bcrypt'


const app = express();
const prisma = new PrismaClient();

dotenv.config();

app.use(express.json());

// Add Swagger
const swaggerDocument = yamljs.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set port
const port = process.env.PORT || 8080;

///TODOS
app.get('/todos', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'todos.html'));
});

app.post('/todos', (req, res) => {
    console.log('In the sign Up');
    // Handle the sign-up logic here
});

///SIGN IN
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signin.html'));
});
// Define a route for sign-in
app.post('/signin', (req, res) => {

    const { email, password } = req.body;

    if (email === 'user' && password === 'user') {
        res.status(200).json({ message: 'Sign in successful' });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

////SIGN UP
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signup.html'));
});

app.post('/signup', (req, res) => {
    console.log('In the sign Up');
    // Handle the sign-up logic here
});

app.post('/users', async (req, res) => {
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
app.post('/sessions', async (req, res) => {

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
const authorizeRequest = async (req: Request, res: Response, next: NextFunction) => {

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
        return res.status(401).send('Invalid session token')
    }

    // Add user to request
    let user = await prisma.user.findUnique({
        where: {
            id: session.userId
        }
    })

    // Validate user
    if (!user) {
        return res.status(401).send('Invalid session token')
    }

    // Add session to request
    // @ts-ignore
    req.sessionToken = sessionToken

    next()
}
app.delete('/sessions', authorizeRequest, async (req, res) => {
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

// Listen to port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}. Documentation at http://localhost:${port}/docs`);
});
