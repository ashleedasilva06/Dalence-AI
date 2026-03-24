import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${apiUrl}/api/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              provider_id: account.providerAccountId,
              email: token.email,
              name: token.name,
              avatar_url: token.picture,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.access_token) {
              token.backendToken = data.access_token;
              token.backendUser = data.user;
            }
          }
        } catch (e) {
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});