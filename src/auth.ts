import NextAuth from "next-auth";
import { cache } from "react";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AdminUser, connect } from "@/lib/db";
import { clientIp, limited } from "@/lib/security";
const input = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(72),
});
const dummyHash =
  "$2b$12$u0RxiZz6DQfSnKPOKCrpKOhOEVtCBJ8gZuxrjbBVB1pGpG5VlPep.";
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const parsed = input.safeParse(credentials);
        if (!parsed.success || !process.env.MONGODB_URI) return null;
        await connect();
        const { email, password } = parsed.data;
        if (
          (await limited("login-ip", clientIp(request.headers), 20, 900000)) ||
          (await limited("login-email", email, 8, 900000))
        )
          return null;
        const user = await AdminUser.findOne({ email });
        const match = await bcrypt.compare(password, user?.hash || dummyHash);
        if (!user || !match) return null;
        return {
          id: String(user._id),
          email: user.email,
          name: String(user.version),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.version = Number(user.name);
      return token;
    },
    async session({ session, token }) {
      if (!token.sub)
        return { ...session, user: { ...session.user, email: "" } };
      await connect();
      const user = await AdminUser.findById(token.sub).select("email version");
      return {
        ...session,
        user: {
          ...session.user,
          email: user && user.version === token.version ? user.email : "",
        },
      };
    },
  },
});
export const adminEmail = cache(async function adminEmail() {
  if (!process.env.AUTH_SECRET || !process.env.MONGODB_URI) return "";
  return (await auth())?.user?.email || "";
});
