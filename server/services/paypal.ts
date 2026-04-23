const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as { access_token: string }
  return data.access_token
}

export async function createPayPalOrder(amount: number, currency: string): Promise<string> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json() as { message?: string }
    throw new Error(`PayPal createOrder failed: ${error.message ?? response.statusText}`)
  }

  const data = await response.json() as { id: string }
  return data.id
}

export async function capturePayPalOrder(
  paypalOrderId: string
): Promise<{ captureId: string; payerName: string; payerEmail: string }> {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  )

  if (!response.ok) {
    const error = await response.json() as { message?: string }
    throw new Error(`PayPal captureOrder failed: ${error.message ?? response.statusText}`)
  }

  const data = await response.json() as {
    purchase_units: { payments: { captures: { id: string }[] } }[]
    payer: { name: { given_name: string; surname: string }; email_address: string }
  }

  const captureId = data.purchase_units[0].payments.captures[0].id
  const payerName = `${data.payer.name.given_name} ${data.payer.name.surname}`
  const payerEmail = data.payer.email_address

  return { captureId, payerName, payerEmail }
}
