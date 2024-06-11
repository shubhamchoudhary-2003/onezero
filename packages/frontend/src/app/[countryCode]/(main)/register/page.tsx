"use client"

import { useFormState } from "react-dom"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { signUp } from "@modules/account/actions"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSession } from "next-auth/react"

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const [message, formAction] = useFormState(signUp, null)

  return (
    <div
      className="flex flex-col items-center justify-center small:flex-row small:items-start py-6 content-container gap-5"
      data-testid="category-container"
    >
      <div
        className="max-w-sm flex flex-col items-center"
        data-testid="register-page"
      >
        <p className="text-large-semi uppercase mb-6 text-xl text-center">
          Become a Medusa Store Member
        </p>
        <p className="text-center text-base-regular mb-4">
          Create your Medusa Store Member profile, and get access to an enhanced
          shopping experience.
        </p>
        <form className="w-full flex flex-col" action={formAction}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
            <Input
              label="Email"
              name="email"
              required
              type="email"
              value={session?.user?.email || ""}
              autoComplete="email"
              data-testid="email-input"
              // disabled
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              data-testid="phone-input"
            />
            <div className="invisible">
              <Input
                label="Password"
                name="password"
                required
                value={session?.user?.name || ""}
                type="password"
                autoComplete="new-password"
                data-testid="password-input"
              />
            </div>
          </div>
          <ErrorMessage error={message} data-testid="register-error" />
          <span className="text-center text-ui-fg-base text-small-regular mt-6">
            By creating an account, you agree to Medusa Store&apos;s{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="underline"
            >
              Privacy Policy
            </LocalizedClientLink>{" "}
            and{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="underline"
            >
              Terms of Use
            </LocalizedClientLink>
            .
          </span>
          <SubmitButton className="w-full mt-6" data-testid="register-button">
            Join
          </SubmitButton>
        </form>
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Already a member?{" "}
          <button
            //   onClick={() => }
            className="underline"
          >
            Sign in
          </button>
          .
        </span>
      </div>
    </div>
  )
}
