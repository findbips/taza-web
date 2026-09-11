import {Router} from 'express';import {z} from 'zod';import {prisma} from '../db';import {requireAuth,requireRole} from '../middleware/auth';import {Role} from '../generated/prisma/client';
const r=Router();
r.post('/',async(req,res,next)=>{try{const d=z.object({email:z.string().email(),source:z.string().optional()}).parse(req.body);await prisma.newsletterSubscriber.upsert({where:{email:d.email.toLowerCase()},update:{source:d.source},create:{email:d.email.toLowerCase(),source:d.source||'website'}});res.status(201).json({ok:true,message:'You are on the list.'})}catch(e){next(e)}});
r.get('/',requireAuth,requireRole(Role.ADMIN),async(_req,res,next)=>{try{res.json({subscribers:await prisma.newsletterSubscriber.findMany({orderBy:{createdAt:'desc'}})})}catch(e){next(e)}});
export default r;
