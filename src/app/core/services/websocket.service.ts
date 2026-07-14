import { Injectable } from '@angular/core';
import { IOrder, orderStatus } from '../interfaces/IOrder.interface';
import { BehaviorSubject, catchError, delay, interval, Observable, of, retry, shareReplay, Subject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);
  private orderStream$ = new Subject<IOrder>();
private mockOrders: IOrder[] = [
    { id: 'ORD-9402', channel: 'Delivery', item: '1x Supreme Sahm Burger, 1x Garlic Fries', status: 'Received', amount: 17.98, timestamp: new Date() },
    { id: 'ORD-9403', channel: 'Walk-in', item: '2x Spicy Volcano Chicken, 1x Mint Cooler', status: 'Preparing', amount: 26.99, timestamp: new Date() },
    { id: 'ORD-9404', channel: 'Online', item: '1x Plant-Based Oasis Burger, 1x Cold Brew', status: 'Ready', amount: 18.24, timestamp: new Date() }
  ];
  constructor() {
    window.addEventListener('online', ()=> this.updateNetworkState(true));
    window.addEventListener('offline', ()=> this.updateNetworkState(false));
   }
  
  getLiveOrders() : Observable<IOrder[]>{
    return of(this.mockOrders).pipe(
      shareReplay({bufferSize:1, refCount:true})
    )
  }
  
  updateNetworkState(isOnline:boolean){
     this.isOnline$.next(isOnline);
    console.warn(`[Network Monitor] System detected connection status: ${ isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }

  getOrderUpdates(){
    return this.orderStream$.asObservable().pipe(
      shareReplay({bufferSize: 1, refCount: true})
    );
  }

  updateOrderStatus(orderId: string, nextStatus: orderStatus){
    console.log(`requesting status update for ${orderId} -> ${nextStatus}`);
    return of(true).pipe(
      delay(600),
      tap(()=> {
        const order = this.mockOrders.find(o => o.id === orderId);
        if(order){
          order.status = nextStatus;
          this.orderStream$.next({...order});
        }
      }),
      retry({count: 3, delay: 1000}),
      catchError(err=> {
        console.error('failed to update status on server:', err);
        return of(false);
      })
    )
  }
 
  getIsSystemOnline(): boolean{
    return this.isOnline$.value;
  }

  startSimulation(){
    interval(7000).pipe(
      switchMap(()=> this.isOnline$.value ? of(true) : of(false))
    ).subscribe((online)=> {
      if(!online || this.mockOrders.length === 0) return ;
      const statuses: orderStatus[] = ['Received', 'Preparing', 'Ready', 'Delivered', 'Completed'];
      const randomIndex = Math.floor(Math.random() * this.mockOrders.length);
      const targetOrder = this.mockOrders[randomIndex];
      const currentStatusIndx = statuses.indexOf(targetOrder.status);
      if(currentStatusIndx < statuses.length-1){
        const nextStatus = statuses[currentStatusIndx + 1];
        targetOrder.status = nextStatus;
        this.orderStream$.next({...targetOrder});
        console.log(`Order ${targetOrder.id} status updated to: ${nextStatus}`);
      }
    })
  }

  connectivity(): Observable<boolean>{
    return this.isOnline$.asObservable();
  }

  
}
