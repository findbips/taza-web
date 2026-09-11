import {Router} from 'express';import {z} from 'zod';import {prisma} from '../db';import {requireAuth,requireRole} from '../middleware/auth';import {Role} from '../generated/prisma/client';
const r=Router();
r.post('/',async(req,res,next)=>{try{const d=z.object({name:z.string().min(2),email:z.string().email(),phone:z.string().optional(),message:z.string().min(5)}).parse(req.body);await prisma.contactMessage.create({data:d});res.status(201).json({ok:true})}catch(e){next(e)}});
r.get('/',requireAuth,requireRole(Role.ADMIN),async(_req,res,next)=>{try{res.json({messages:await prisma.contactMessage.findMany({orderBy:{createdAt:'desc'}})})}catch(e){next(e)}});
export default r;
