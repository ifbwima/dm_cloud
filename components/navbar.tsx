import React from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import {signIn, signOut, useSession} from "next-auth/react";
 
export default function NavbarDefault() {
  const {data: session} = useSession()

  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-2 lg:px-8 lg:py-4">
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          className="mr-4 cursor-pointer py-1.5 font-medium"
        >
          {session ? (
               <h1>{session.user?.name} à toi</h1>
          ) : 
          <h1>Connecte toi</h1>}
        </Typography>
        <div className="flex items-center gap-x-1">
          {session ? (
            <Button fullWidth variant="text" size="sm" className="" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : 
            <Button fullWidth variant="text" size="sm" className="" onClick={() => signIn()}>
              Sign In
            </Button>
          }
        </div>
      </div>
    </Navbar>
  );
}
