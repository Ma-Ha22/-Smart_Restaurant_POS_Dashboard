export type Categories = 'burgers' | 'sides' | 'drinks';
export interface IProduct{
    id:string;
    name: string;
    category: Categories;
    price:number;
    ingredients: string;
    isAvailable:boolean;
}
