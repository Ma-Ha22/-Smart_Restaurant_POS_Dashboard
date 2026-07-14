
export type orderStatus = 'Received' | 'Preparing' | 'Ready' | 'Delivered' | 'Completed';
export type orderChannel = 'Walk-in' | 'Delivery' | 'Online';
export interface IOrder{
    id:string;
    item: string;
    channel: orderChannel;
    status: orderStatus;
    amount: number;
    timestamp: Date;
}