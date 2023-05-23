// Add express
import express from 'express'
const app  = express()


//Add prisma

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


// Add dotnev
import dotenv from 'dotenv'
dotenv.config()

//Add Swagger
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
const swaggerDocument = yamljs.load('./swagger.yaml')
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Serve static files
app.use(express.static('public'))

//set port
const port = process.env.Port || 8080

//Listen to port
app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}. Documentation at http://localhost:${port}/docs`)
})