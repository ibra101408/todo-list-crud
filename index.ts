import {NextFunction, Response, Request} from 'express';
const express = require('express');
const sessions = require('express-session');
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

    //
    .listen(8080, () => {
        console.log("Server is running at port 8080 ");
    });
const expressWs = require('express-ws')(app, httpsServer);

    app.ws('/', function () {

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
//const port = process.env.PORT || 8080;

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
    sessionToken: string;
    isGoogleUser: boolean;

}


///TODOS
app.get('/todos', (req: Request, res: Response) => {
    //console.log(req.sessionToken);
    res.sendFile(path.join(__dirname, 'src', 'components', 'todos.html'));
});

app.post('/todos', (req: Request, res: Response) => {
});


///GOOGLE

function isLoggedIn(req: IRequestWithSession, res: Response, next: NextFunction) {
    //console.log(req.sessionToken);
    req.user  ? next() : res.sendStatus(401);
};


require('./auth');
const passport = require('passport');
app.use(sessions({ secret: 'cats' }));
app.use(passport.initialize());
app.use(passport.session());

//google auth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })

);

app.get('/google/callback',
    async (req: IRequestWithSession, res: Response) => {
        // Generate and set a session token for the user here

        const session = await prisma.session.create({
            data: {
                userId: 1,
                expires: new Date(),
            },
        });
        res.status(201).json({
            sessionToken: session.sessionToken,
            isGoogleUser: true,
        })

        // If authentication is successful, redirect to /todos
        passport.authenticate('google', {
            successRedirect: '/todos',
            failureRedirect: '/auth/failure'
        });
    });
//google callback
/*
app.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/todos',
        failureRedirect: '/auth/failure'
    }),
);*/

//failure
app.get ('/auth/failure', (req: Request, res: Response) => {
    res.send('Failed to authenticate..');
});

app.get('/logout', (req: IRequestWithSession, res: Response) => {
    req.logout((err: Error) => {
        if (err) {
            // Handle error
            return res.status(500).json({ error: 'Failed to log out' });
        }

        req.session.destroy();
        res.send('Goodbye!');
    });
});
/*
app.get('/google/callback',
    async (req: IRequestWithSession, res: Response) => {
    // Generate and set a session token for the user here
    console.log("we are here222");

    const session = await prisma.session.create({
        data: {
            userId: 1,
            expires: new Date(),
        },
});
    console.log("we are here");
    res.status(201).json({
        sessionToken: session.sessionToken,
        isGoogleUser: true,
    })

        console.log("we are here3");
    // If authentication is successful, redirect to /todos
    passport.authenticate('google', {
        successRedirect: '/todos',
        failureRedirect: '/auth/failure'
    });

});*////
/*
app.get('/google/callback', async (req: IRequestWithSession, res: Response, next: NextFunction) => {
    try {
        // Generate and set a session token for the user here
        console.log("we are here222");

        const session = await prisma.session.create({
            data: {
                userId: 1,
                expires: new Date(),
            },
        });

        console.log("we are here");

        // Save the session token in local storage
        localStorage.setItem('sessionToken', session.sessionToken);

        res.status(201).json({
            sessionToken: session.sessionToken,
            isGoogleUser: true,
        });

        console.log("we are here3");
        // If authentication is successful, redirect to /todos
        passport.authenticate('google', {
            successRedirect: '/todos',
            failureRedirect: '/auth/failure'
        })(req, res, next);
    } catch (error) {
        // Handle any errors that occur during session creation or JSON response
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});*/



    /*async (req: IRequestWithSession, res: PostSessionResponse) => {
    // Create session for Google user
    const session = await prisma.session.create({
        data: {
            userId: req.user.id,
            expires: new Date(),
        },
    });

    // Return session token and set isGoogleUser flag to true
    res.status(201).json({
        sessionToken: session.sessionToken,
        isGoogleUser: true,
    });
});
*/

//protected route
/*app.get('/protected', isLoggedIn, (req: IRequestWithSession, res: Response) => {
    res.send(`Hello ${req.user.displayName}`);
});*/


///SIGN IN
app.get('/signin', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signin.html'));

//    res.send('<a href="/auth/google">Auth with Google</a>');
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

app.post('/googleSessions', async (req: PostSessionRequest, res: PostSessionResponse) => {
    // Create session
    const session = await prisma.session.create({
        data: {
            userId: 999,
            expires: new Date(),
        }
    });

    // Return session
    res.status(201).json({
        sessionToken: session.sessionToken
    })
});

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
/*const authorizeRequest = async (req: IRequestWithSession, res: Response, next: NextFunction) => {
    // Validate session
    if (!req.headers.authorization) {
        return res.status(401).send('Authorization header required');
    }

    // Validate extract session format
    if (!req.headers.authorization.startsWith('Bearer') || req.headers.authorization.split(' ').length !== 2) {
        return res.status(401).send('Invalid authorization header format');
    }

    // Extract sessionToken
    const sessionToken = req.headers.authorization.split(' ')[1];

    const session = await prisma.session.findUnique({
        where: {
            sessionToken: sessionToken,
        },
    });

    if (!session) {
        return res.status(401).send('Invalid session token');
    }

    // Check if the user is a Google user
    if (req.user && req.user.provider === 'google') {
        req.isGoogleUser = true;
    }

    // Add user to request
    let user;
    if (req.isGoogleUser) {
        user = req.user;
    } else {
        user = await prisma.user.findUnique({
            where: {
                id: session.userId,
            },
        });
    }

    // Validate user
    if (!user) {
        return res.status(401).send('Invalid session token');
    }

    // Add session to request
    req.userId = user.id;
    req.sessionToken = session.sessionToken; // Use session.sessionToken here

    next();
};

*/


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
});

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

        res.status(201).json("newItem");

        expressWs.getWss().clients.forEach((client: any) => client.send(JSON.stringify({
            type: 'create',
            item: newItem
        })));

        res.status(201).end();
    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
});

app.put('/items/:id', authorizeRequest, async (req: IRequestWithSession, res: Response) => {

    try {
        console.log(req.body)
        // Get id from req.params
        const { id } = req.params;
        const { description, completed } = req.body;
        const newDescription = String(description);


        if (!description) {
            return //res.status(400).send('Description required2 ');
        }

        const item = await prisma.item.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!item || item.userId !== req.userId) {
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

        res.status(200).json(updatedItem);
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
       expressWs.getWss().clients.forEach(
           (client: any) =>
                client.send(JSON.stringify({
                    type: 'delete',
                    id: deletedItem.id
            }))
       );

        res.status(201).json(item);
    }

    catch (error) {
        res.status(500).send((error as Error).message || 'Something went wrong')
    }
});

