"use client"

import { signIn } from "next-auth/react"
import { FaDiscord } from "react-icons/fa6"

export default function SignIn() {
  const handleSignIn = async () => {
    await signIn("discord", { callbackUrl: "http://localhost:3000/" })
  }

  return (
    <div className="flex justify-center pr-[240px]">
     <a
        type="button"
        href={`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/auth/discord/`}
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
      >
        Login with Discord
      </a>
    </div>
  )
}
