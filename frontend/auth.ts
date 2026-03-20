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
            console.log("[Auth] Backend response:", JSON.stringify(data));
            if (data.access_token) {
              token.backendToken = data.access_token;
              token.backendUser = data.user;
              console.log("[Auth] Token stored in JWT:", !!token.backendToken);
            }
          }
        } catch (e) {
          console.error("[Auth] Backend sync failed:", e);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("[Auth] Session callback, token keys:", Object.keys(token));
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      console.log("[Auth] Session backendToken set:", !!session.backendToken);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});