import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { WebsocketService } from '../../core/services/websocket.service';
import { scan, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { IOrder, orderChannel, orderStatus } from '../../core/interfaces/IOrder.interface';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-live-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, NgClass, CurrencyPipe],
  templateUrl: './live-orders.component.html',
  styleUrl: './live-orders.component.css'
})
export class LiveOrdersComponent implements OnInit{

   private webSocketServ = inject(WebsocketService);
   selectedChannel = signal<string>('ALL');
   orders$ = this.webSocketServ.getLiveOrders().pipe(
    switchMap((initialOrders:IOrder[]) => this.webSocketServ.getOrderUpdates().pipe(
      startWith(null),
      scan((accumulatedOrders, update) => {
        if(!update) return accumulatedOrders;
        const index = accumulatedOrders.findIndex(o => o.id == update.id);
        if(index > -1){
          const updatedList = [...accumulatedOrders];
          updatedList[index] = update;
          return updatedList;

        }
        return [...accumulatedOrders, update];
      }, initialOrders
    )
    ))
   );


allOrders = toSignal(this.orders$, {initialValue : [] as IOrder[]});

filteredOrders = computed(()=>{
  const orders = this.allOrders();
  const channel = this.selectedChannel();
  if(channel === 'ALL') return orders;
  return orders.filter(o => o.channel == channel)
});

  ngOnInit(): void {
    console.log('liveOrdersComponent');
  }

setChannel(channel:string){
  this.selectedChannel.set(channel);
}
changeStatus(orderId:string, nextStatus: orderStatus){
  this.webSocketServ.updateOrderStatus(orderId,nextStatus).subscribe(success=>{
    if(success){
      console.log(`order ${orderId} successfully transitioned to ${nextStatus}`);
    }
    else {console.error(`[UI Action] failed to transition order ${orderId}`)}
  })
}

getChannelClass(channel: orderChannel): string {
    switch (channel) {
      case 'Walk-in': return 'bg-info text-dark';
      case 'Delivery': return 'bg-warning text-dark';
      case 'Online': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusClass(status: orderStatus): string {
    switch (status) {
      case 'Received': return 'bg-dark text-white border border-secondary';
      case 'Preparing': return 'bg-warning text-dark';
      case 'Ready': return 'bg-success text-white';
      case 'Delivered': return 'bg-primary text-white';
      case 'Completed': return 'bg-secondary text-white';
      default: return 'bg-dark text-white';
    }
  }

  public trackByOrderId(index: number, order: IOrder): string {
    return order.id;
  }



}
