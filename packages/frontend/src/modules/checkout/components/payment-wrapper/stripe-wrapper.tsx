"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

import { PaymentSession } from "@medusajs/medusa"

type StripeWrapperProps = {
    paymentSession: PaymentSession
    stripeKey?: string
    stripePromise: Promise<Stripe | null> | null
    children: React.ReactNode
  }

const StripeWrapper: React.FC<StripeWrapperProps> = ({
    paymentSession,
    stripeKey,
    stripePromise,
    children,
  }) => {
    const clientSecret = (paymentSession!.data?.client_secret as string | undefined)||
    ((paymentSession.data?.latest_invoice as any)?.payment_intent?.client_secret as string | undefined)
    const options: StripeElementsOptions = {
      clientSecret: clientSecret,  
    }

    console.log(`client secret ${options.clientSecret}`)
  
    if (!stripeKey) {
      throw new Error(
        "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
      )
    }
  
    if (!stripePromise) {
      throw new Error(
        "Stripe promise is missing. Make sure you have provided a valid Stripe key."
      )
    }

    if (!clientSecret) {
      console.log(JSON.stringify(paymentSession))
      throw new Error(
        "Stripe client secret is missing. Cannot initialize Stripe."
      )
    }
  
    return (
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    )
  }

  export default StripeWrapper