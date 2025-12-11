import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    {
      id: "clockify",
      name: "Clockify",
      type: "oauth",
      authorization: process.env.CLOCKIFY_AUTHORIZATION_URL,
      token: process.env.CLOCKIFY_TOKEN_URL,
      userinfo: process.env.CLOCKIFY_USERINFO_URL,
      clientId: process.env.CLOCKIFY_CLIENT_ID,
      clientSecret: process.env.CLOCKIFY_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.id ?? profile.sub ?? profile.userId ?? "",
          name: profile.name ?? profile.fullName ?? "",
          email: profile.email ?? "",
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        return {
          ...token,
          accessToken: (account as any).access_token,
          refreshToken: (account as any).refresh_token,
        };
      }

      return token;
    },
    async session({ session, token }: any) {
      return {
        ...session,
        accessToken: (token as any).accessToken,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
