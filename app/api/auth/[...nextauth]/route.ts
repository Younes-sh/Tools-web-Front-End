import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // اگر کاربر از طریق OAuth وارد شده
      if (account && profile) {
        try {
          // ارسال درخواست به بک‌اند برای ثبت‌نام/ورود
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`, {
            email: profile.email,
            name: profile.name,
            provider: account.provider,
            providerId: profile.sub || profile.id
          });

          if (response.data.success) {
            // ذخیره توکن بک‌اند در token
            token.backendToken = response.data.data.token;
            token.user = response.data.data.user;
          }
        } catch (error) {
          console.error('Error syncing with backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // اضافه کردن توکن بک‌اند به session
      session.backendToken = token.backendToken;
      session.user = token.user || session.user;
      return session;
    },
  },
});

export { handler as GET, handler as POST };