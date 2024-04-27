import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import appRouter from './router'
import {corsSetup} from './config/cors';

dotenv.config();

const app: Express = express();

if(process.env.NODE_ENV === 'development') app.enable('trust proxy');

app.use((req: Request, res: Response, next: NextFunction) =>{
    corsSetup(req, res, next);
}); 

app.use((req: Request, res: Response, next: NextFunction)=>{
    console.log("IP",  req.ip, req.socket.remoteAddress)
    next()
})

app.use(express.json()); 

app.use(express.urlencoded({extended: true}));


app.get('/', (req: Request, res: Response, next: NextFunction)=>{
    res.send("Welcome to my api")
})

app.use('/api/v1', appRouter);


const port = process.env.PORT||8081;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});