import express from "express";
import cors from 'cors'
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const port = 5000



const prisma = new PrismaClient({ log: ['warn', 'error', 'info', 'query'] })

app.get('/users', async (req, res) => {
    const getUser = await prisma.user.findMany()
    res.send(getUser)
})

app.post('/sign-up', async (req, res) => {

    try {
        const match = await prisma.user.findUnique({
            where: { email: req.body.email }
        })
        if (match) {
            res.status(400).send({ error: "This Email is already in use" })
        } else {
            const newUser = await prisma.user.create({
                data: {
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password)
                }
            })
            res.send(newUser)
        }
    } catch (error) {
        res.status(404).send(error)
    }

})

app.post('/log-in', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.body.email }
    })
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.send({ user: user })
    } else {
        res.send({ error: "Incorrect Email or password. Try again!" })
    }
})

app.listen(port, () => {
    console.log(`App is running in http://localhost:${port}`)
})