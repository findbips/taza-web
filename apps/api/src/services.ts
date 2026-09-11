import crypto from 'crypto';
export function createOrderNumber(){return `TAZA-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;}
export function calculateCoupon(type:'PERCENT'|'FIXED',value:number,subtotal:number){
  const raw=type==='PERCENT'?Math.floor(subtotal*value/100):value;
  return Math.max(0,Math.min(raw,subtotal));
}
