"use server"

import authOptions from "@/lib/authOptions"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import createResources from "@/lib/create-vm"

async function getSessionRole() {
    const session = await getServerSession(authOptions)

    return session?.userRole 
}

export async function POST(req: Request) {
    const sessionRole = await getSessionRole()

    if (!sessionRole && sessionRole === "rien") {
        return NextResponse.json(
            {
                status: "error",
                message: "T'as pas de droit TRICHEUR",
            },
            { status: 401 }
        )
    }

    try {
        const { osMachine } = await req.json();
        const response = await createResources(osMachine)

        return NextResponse.json(
            {
                status: "success",
                message: "VM created",
                data: response,
            },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            {
                status: "error",
                message: error.message || "Internal Server Error",
            },
            { status: 500 }
        )
    }
}