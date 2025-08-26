declare module 'midtrans-client' {
  export interface MidtransClientConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export class CoreApi {
    constructor(options: MidtransClientConfig);
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    transaction: {
      status(transactionId: string): Promise<any>;
      cancel(transactionId: string): Promise<any>;
      approve(transactionId: string): Promise<any>;
      deny(transactionId: string): Promise<any>;
    };
  }

  export class Snap {
    constructor(options: MidtransClientConfig);
    createTransaction(parameter: any): Promise<any>;
    createTransactionToken(parameter: any): Promise<any>;
    createTransactionRedirectUrl(parameter: any): Promise<any>;
  }

  const midtransClient: {
    CoreApi: typeof CoreApi;
    Snap: typeof Snap;
  };

  export default midtransClient;
}
