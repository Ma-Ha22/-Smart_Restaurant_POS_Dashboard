import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { MenuService } from '../../../core/services/menu.service';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IProduct } from '../../../core/interfaces/IProduct.interface';
import { CurrencyPipe, NgIf , NgFor} from '@angular/common';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CurrencyPipe,NgIf, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css',
})
export class ProductSearchComponent {
  menuServ = inject(MenuService);
  @ViewChild('searchInput') searchInputEl!:ElementRef<HTMLInputElement>;
  queryStream$ = new Subject<string>();
  private currentSearchQuery = '';
  private categoryStream$ = new BehaviorSubject<string>('ALL');
  isLoading = signal<boolean>(false);
  activeRowIndex = signal<number>(-1);
  recentSearches = signal<string[]>(['Burger']);
  searchPipeLine$ = combineLatest([
    this.queryStream$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
    ),
    this.categoryStream$,
  ]).pipe(
    tap(([query]) => {
      this.currentSearchQuery = query;
      this.isLoading.set(true);
      this.activeRowIndex.set(-1);
    }),
    switchMap(([query, category]) =>
      this.menuServ.searchProducts(query, category),
    ),
    tap(() => this.isLoading.set(false)),
  );

  results = toSignal(this.searchPipeLine$, { initialValue: [] as IProduct[] });
  onSearch(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.queryStream$.next(val);
  }

  onCategoryChange(event: Event){
    const val = (event.target as HTMLSelectElement).value;
    this.categoryStream$.next(val);
  }
public handleKeyboardNavigation(event: KeyboardEvent): void {
    const productsList = this.results();
    if (productsList.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault(); // منع نزول الصفحة بالكامل
      const nextIndex = (this.activeRowIndex() + 1) % productsList.length;
      this.activeRowIndex.set(nextIndex);
    } 
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (this.activeRowIndex() - 1 + productsList.length) % productsList.length;
      this.activeRowIndex.set(prevIndex);
    } 
    else if (event.key === 'Enter') {
      event.preventDefault();
      const currentIndex = this.activeRowIndex();
      if (currentIndex >= 0 && currentIndex < productsList.length) {
        this.selectProduct(productsList[currentIndex]);
      }
    }
  }

public selectProduct(product: IProduct): void {
    console.log(`[POS Transaction] Product chosen for billing: ${product.name}`);
    
    if (this.currentSearchQuery) {
      const currentRecents = this.recentSearches();
      if (!currentRecents.includes(this.currentSearchQuery)) {
        const updated = [this.currentSearchQuery, ...currentRecents].slice(0, 5);
        this.recentSearches.set(updated);
      }
    }

}
applyRecentSearch(term: string): void {
    this.searchInputEl.nativeElement.value = term;
    this.currentSearchQuery = term;
    this.queryStream$.next(term);
  }

  highlightMatch(text:string){
    if(!this.currentSearchQuery) return text;
    const regex = new RegExp(`${this.currentSearchQuery}`, 'gi');
    return text.replace(regex,`<mark class="bg-info text-dark px-0.5 rounded fw-bold">$1</mark>`);
  }
}
