export type Product={id:string;slug:string;name:string;category:string;shortDescription?:string|null;description:string;price:number;compareAtPrice?:number|null;stock:number;sku:string;weightGrams?:number|null;ingredients?:string|null;active:boolean;imageUrl?:string|null};
export type CartItem=Product & {quantity:number};
