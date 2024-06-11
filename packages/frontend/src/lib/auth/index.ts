import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_APP_CLIENT_ID || "1237086103115137126",
      clientSecret:
        process.env.DISCORD_APP_CLIENT_SECRET ||
        "33yt8CIVMo3gqR0OlKo-te_8xucY-e0u",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token, user }) {
      // if (token) {
      //   if (token?.picture?.includes("discord")) {
      //     session.user.id = token.sub;
      //   }
      // }
      return session
    },
  },
}
