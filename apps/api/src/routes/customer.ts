import {Router} from 'express';import {z} from 'zod';import {prisma} from '../db';import {requireAuth} from '../middleware/auth';
const r=Router();r.use(requireAuth);
const address=z.object({label:z.string().min(1).max(40),recipientName:z.string().min(2),phone:z.string().min(6).max(30),addressLine:z.string().min(5),area:z.string().optional(),city:z.string().min(2),postalCode:z.string().optional(),isDefault:z.boolean().optional()});
r.get('/addresses',async(req,res,next)=>{try{res.json({addresses:await prisma.address.findMany({where:{userId:req.auth!.userId},orderBy:[{isDefault:'desc'},{createdAt:'desc'}]})})}catch(e){next(e)}});
r.post('/addresses',async(req,res,next)=>{try{const d=address.parse(req.body);const a=await prisma.$transaction(async tx=>{if(d.isDefault)await tx.address.updateMany({where:{userId:req.auth!.userId},data:{isDefault:false}});return tx.address.create({data:{...d,userId:req.auth!.userId}})});res.status(201).json({address:a})}catch(e){next(e)}});
r.delete('/addresses/:id',async(req,res,next)=>{try{await prisma.address.delete({where:{id:req.params.id,userId:req.auth!.userId}});res.json({ok:true})}catch(e){next(e)}});
r.post('/reviews',async(req,res,next)=>{try{const d=z.object({productId:z.string(),rating:z.number().int().min(1).max(5),title:z.string().max(100).optional(),body:z.string().min(5).max(2000)}).parse(req.body);const review=await prisma.review.create({data:{...d,userId:req.auth!.userId}});res.status(201).json({review})}catch(e){next(e)}});
export default r;
