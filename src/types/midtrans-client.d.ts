declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionRequest {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    item_details?: Array<{
      id?: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    customer_details?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      email?: string;
      phone?: string;
    };
    credit_card?: {
      secure: boolean;
    };
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
    [key: string]: any;
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(
      parameter: TransactionRequest
    ): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(parameter: TransactionRequest): Promise<string>;
    createTransactionRedirectUrl(parameter: TransactionRequest): Promise<string>;
    transaction: {
      status(orderId: string): Promise<any>;
      approve(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameter: any): Promise<any>;
    };
  }

  class CoreApi {
    constructor(config: SnapConfig);
    charge(parameter: any): Promise<any>;
    transaction: {
      status(orderId: string): Promise<any>;
      approve(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameter: any): Promise<any>;
    };
  }

  export = { Snap, CoreApi };
}
