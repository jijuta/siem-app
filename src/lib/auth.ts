import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { query } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await query(
            'SELECT * FROM siem_app.users WHERE email = $1 AND is_active = true',
            [credentials.email]
          )

          const user = result.rows[0]

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          )

          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await query(
            'UPDATE siem_app.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
          )

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url,
            phone: user.phone,
            department: user.department
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatar_url = user.avatar_url
        token.phone = user.phone
        token.department = user.department
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatar_url = token.avatar_url as string | null
        session.user.phone = token.phone as string | null
        session.user.department = token.department as string | null
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
