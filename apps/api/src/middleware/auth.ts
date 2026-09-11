import jwt from 'jsonwebtoken';
import {Request,Response,NextFunction} from 'express';
import {Role} from '../generated/prisma/client';

declare global { namespace Express { interface Request { auth?: {userId:string;role:Role} } } }
const secret=process.env.JWT_SECRET || (process.env.NODE_ENV==='production' ? (()=>{throw new Error('JWT_SECRET is required in production')})() : 'dev-secret-change-me');
export function signToken(userId:string,role:Role){return jwt.sign({userId,role},secret,{expiresIn:'7d'});}
export function requireAuth(req:Request,res:Response,next:NextFunction){
  try { const token=req.cookies?.taza_session; if(!token) return res.status(401).json({message:'Authentication required'}); const p=jwt.verify(token,secret) as {userId:string;role:Role}; req.auth=p; next(); }
  catch{return res.status(401).json({message:'Invalid or expired session'});}
}
export function optionalAuth(req:Request,_res:Response,next:NextFunction){ try { const token=req.cookies?.taza_session; if(token){ const p=jwt.verify(token,secret) as {userId:string;role:Role}; req.auth=p; } } catch {} next(); }
export function requireRole(...roles:Role[]){return (req:Request,res:Response,next:NextFunction)=>{if(!req.auth||!roles.includes(req.auth.role)) return res.status(403).json({message:'Forbidden'}); next();};}
