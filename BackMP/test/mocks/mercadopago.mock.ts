export const mockMercadoPagoConfig = {
  accessToken: 'test-token',
};

export const mockPreference = {
  create: jest.fn().mockResolvedValue({
    id: 'test-pref-id',
    init_point: 'https://mercadopago.com/checkout/test',
    items: [{
      title: 'Test Product',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: 100
    }]
  })
};

export const mockPayment = {
  get: jest.fn().mockResolvedValue({
    id: 'test-payment-id',
    status: 'approved',
    status_detail: 'accredited',
    transaction_amount: 100,
    currency_id: 'ARS',
    preference_id: 'test-pref-id'
  }),
  refund: jest.fn().mockResolvedValue({
    id: 'test-refund-id',
    payment_id: 'test-payment-id',
    amount: 100,
    status: 'approved',
    date_created: new Date().toISOString()
  })
};

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => mockMercadoPagoConfig),
  Preference: jest.fn().mockImplementation(() => mockPreference),
  Payment: jest.fn().mockImplementation(() => mockPayment)
})); 