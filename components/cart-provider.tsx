'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';import type {CartItem,Product} from '../lib/types';
type Ctx={items:CartItem[];add:(p:Product)=>void;remove:(id:string)=>void;setQty:(id:string,q:number)=>void;clear:()=>void;subtotal:number;count:number};
const CartContext=createContext<Ctx|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){const [items,setItems]=useState<CartItem[]>([]);useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('taza_cart')||'[]'))}catch{}},[]);useEffect(()=>{localStorage.setItem('taza_cart',JSON.stringify(items))},[items]);
const value=useMemo(()=>({items,add:(p:Product)=>setItems(a=>{const x=a.find(i=>i.id===p.id);return x?a.map(i=>i.id===p.id?{...i,quantity:i.quantity+1}:i):[...a,{...p,quantity:1}]}),remove:(id:string)=>setItems(a=>a.filter(i=>i.id!==id)),setQty:(id:string,q:number)=>setItems(a=>q<=0?a.filter(i=>i.id!==id):a.map(i=>i.id===id?{...i,quantity:q}:i)),clear:()=>setItems([]),subtotal:items.reduce((s,i)=>s+i.price*i.quantity,0),count:items.reduce((s,i)=>s+i.quantity,0)}),[items]);return <CartContext.Provider value={value}>{children}</CartContext.Provider>}
export function useCart(){const c=useContext(CartContext);if(!c)throw new Error('useCart must be inside CartProvider');return c;}
