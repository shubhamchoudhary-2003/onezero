"use client"

import { Customer } from "@medusajs/medusa"
import React, { useEffect } from "react"
import { useFormState } from "react-dom"

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { updateCustomerBanetoUsername } from "@modules/account/actions"

type MyInformationProps = {
  customer: Omit<Customer, "password_hash">
}

const ProfileBanetoUsername: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useFormState(updateCustomerBanetoUsername, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Baneto Username"
        currentInfo={`${customer.metadata.baneto_username??"No Baneto Username"}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-baneto-username-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Baneto Username"
            name="banetousername"
            autoComplete="baneto username"
            required
            defaultValue={customer.metadata.baneto_username as string??""}
            data-testid="baneto-username-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileBanetoUsername
