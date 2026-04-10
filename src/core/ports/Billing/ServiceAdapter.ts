export interface BillingServiceAdapter<C> {
  createCheckoutSession: (email: string, returnUrl: string) => Promise<C>
  getCheckoutSession: (checkoutId: string) => Promise<C>
}
