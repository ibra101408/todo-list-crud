import express from 'express';

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
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

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'signin.html'));
});

app.post('/signin', (req, res) => {
    console.log('In the sign in');
});

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

// Listen to port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}. Documentation at http://localhost:${port}/docs`);
});
