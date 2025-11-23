import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
    avatar_url?: string | null
    phone?: string | null
    department?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar_url?: string | null
      phone?: string | null
      department?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    avatar_url?: string | null
    phone?: string | null
    department?: string | null
  }
}
