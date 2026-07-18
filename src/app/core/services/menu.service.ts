import { Injectable } from '@angular/core';
import { Categories, IProduct } from '../interfaces/IProduct.interface';
import { delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
mockProducts: IProduct[] = [
    { id: 'P101', name: 'Supreme Sahm Burger', category: 'burgers', price: 12.99, ingredients: 'لحم أنجوس، جبنة شيدر، خس، صوص سهم الخاص', isAvailable: true },
    { id: 'P102', name: 'Spicy Volcano Chicken', category: 'burgers', price: 11.50, ingredients: 'دجاج مقرمش حار، هالابينو، صلصة البركان', isAvailable: true },
    { id: 'P103', name: 'Plant-Based Oasis Burger', category: 'burgers', price: 13.25, ingredients: 'بروتين الصويا النباتي، جبن نباتي، خس، أفوكادو', isAvailable: true },
    { id: 'P201', name: 'Golden Garlic Fries', category: 'sides', price: 4.99, ingredients: 'بطاطس مقطعة يدوياً، زيت الثوم المشوي، بقدونس', isAvailable: true },
    { id: 'P202', name: 'Crispy Onion Halos', category: 'sides', price: 5.50, ingredients: 'حلقات البصل الحلو، عجينة الشعير، تغميسة الأيولي', isAvailable: true },
    { id: 'P203', name: 'Buffalo Cauliflower Bites', category: 'sides', price: 6.75, ingredients: 'قرنبيط متبل، صوص البافالو الحار، جبنة ريكوتا', isAvailable: false }, // غير متوفر حالياً لاختبار الحالات
    { id: 'P301', name: 'Minty Emerald Cooler', category: 'drinks', price: 3.99, ingredients: 'نعناع طازج، ليمون، صودا فوارة، سيرب قصب السكر', isAvailable: true },
    { id: 'P302', name: 'Pomegranate Fizz', category: 'drinks', price: 4.25, ingredients: 'مركز الرمان، جنجر إيل، شرائح ليمون', isAvailable: true },
    { id: 'P303', name: 'Cold Brew Espresso Tonic', category: 'drinks', price: 4.99, ingredients: 'قهوة باردة مقطرة، ماء تونيك، قشر البرتقال', isAvailable: true }
  ];
  constructor() { }
  getAllProducts(){
    return of(this.mockProducts).pipe(
      delay(300)
    )
  }
  searchProducts(query:string,category:string){
    console.log(`[API Request] Searching for: "${query}" in category: "${category}"`);
    const formattedQuery = query.trim().toLowerCase();
    const filtered = this.mockProducts.filter(product=>{
      const matchesCategory = category === 'ALL' || product.category === category;
      const matchesQuery = !formattedQuery || 
        product.name.toLowerCase().includes(formattedQuery) ||
        product.id.toLowerCase().includes(formattedQuery) ||
        product.ingredients.toLowerCase().includes(formattedQuery);

        return matchesCategory && matchesQuery;
    });
    return of(filtered).pipe(delay(400));
  }
}
