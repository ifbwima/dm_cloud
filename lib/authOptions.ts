import CredentialsProvider from "next-auth/providers/credentials"
import {NextAuthOptions} from "next-auth"

const user1 = {
    name:"coucou",
    password:"coucou",
    role: "tout"
}
const user2 = {
    name:"salut",
    password:"salut",
    role: "rien"
}
const user3 = {
    name:"bonjour",
    password:"bonjour",
    role: "justeun"
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                name: {
                    label: "name",
                    type: "name",
                    placeholder: "coucou"
                },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {

                if (!credentials?.name || !credentials.password) {
                    return null
                }

                const user = await (credentials.name === user1.name && credentials.password === user1.password) ? user1 : (credentials.name === user2.name && credentials.password === user2.password) ? user2 : (credentials.name === user3.name && credentials.password === user3.password) ? user3 : null

                if (!user) {
                    return null
                }


                return {
                    name: user.name,
                    role: user.role
                } as any
            }
        })
    ],
    callbacks: {
        session: ({ session, token }) => ({
            ...session,
            user: {
                ...session.user,
            },
            userRole: session.user && session.user.name === user1.name ? "tout" : session.user && session.user.name === user2.name ? "rien" : session.user && session.user.name === user3.name ? "justeun" : "rien"
            
        }),
        jwt: ({ token, user }) => {
            if (user) {
                return {
                    ...token,
                }
            }

            return token
        }
    },
}
export default authOptions