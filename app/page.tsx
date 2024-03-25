"use client"
import {useSession} from "next-auth/react";
import NavbarDefault from "../components/navbar";
import {Button, Dialog, DialogBody} from "@material-tailwind/react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
    const {data: session} = useSession()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isMachineRunning, setIsMachineRunning] = useState(false)
    const [data, setData] = useState({} as any)

    const handleOpen = async (osMachine: string) => {
      if (!isMachineRunning) {
        setIsLoading(true)
        setOpen(!open);
        const data = await createVm(osMachine).then(() => {
          setIsLoading(false) 
          setIsMachineRunning(true)
        })
        
      } else {
        setOpen(!open);
      }
    }

    const handleClick = () => {
      setOpen(!open);
    }

    const createVm = async (osMachine: string) => {
        const response = await fetch("/api/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ osMachine }),
        })

        setTimeout(() => {
          setIsMachineRunning(false);
          setData(JSON.parse("{\"username\":\"Deleted Resource\",\"password\":\"Deleted Resource\",\"ipAddr\":\"Deleted Resource\"}"))
        }, 90000);
        
        const data = await response.json()
        setData(JSON.parse(data.data))
        console.log(data)
    }

  return (
   <div>
     <NavbarDefault/>
     <div className="flex w-screen h-screen gap-3">
      {session && session.userRole === "tout" ? (
          <>
            <Button onClick={() => handleOpen("windows")} color='blue-gray' className="w-1/3 rounded flex items-center justify-center">
                <Image className="justify-center" src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Windows_logo_-_2012.svg" width={200} height={200} alt="logo"/>      
            </Button>
            <Button onClick={() => handleOpen("ubuntu")} color="green" className="w-1/3 rounded flex items-center justify-center">
              <Image className="justify-center" src="https://upload.wikimedia.org/wikipedia/commons/9/9e/UbuntuCoF.svg" width={200} height={200} alt="logo"/>      
            </Button>
            <Button onClick={() => handleOpen("debian")} color="amber" className="w-1/3 rounded flex items-center justify-center">
            <Image className="justify-center" src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Debian-OpenLogo.svg" width={200} height={200} alt="logo"/>      
            </Button>
          </>
        ) : session && session.userRole === "justeun" ? (
          <Button onClick={() => handleOpen("debian")} color="amber" className="w-full rounded flex items-center justify-center">
            <Image className="justify-center" src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Debian-OpenLogo.svg" width={200} height={200} alt="logo"/>      
            </Button>
        ) : (
          <Button className="w-full rounded flex items-center justify-center">
            <p>Aucune VM dommage pour toi mon gars</p>
          </Button>
        )
        }

      <Dialog
        open={open}
      >
          <DialogBody>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-sky-500"> Username: {data?.username} </p> 
                <p className="text-amber-500"> Password: {data?.password} </p> 
                <p className="text-rose-600"> IP Address: {data?.ipAddr} </p>
              </div>
            )}
          </DialogBody>
      </Dialog>
     </div>
   </div>
  );
}
