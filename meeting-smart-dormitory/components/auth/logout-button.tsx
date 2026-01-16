"use client"

import { logout } from "@/actions/auth-actions"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Optional: if we wanted to enforce Shadcn style

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
}

export function LogoutButton({ children, className, ...props }: LogoutButtonProps) {
    return (
        <button
            onClick={() => logout()}
            className={cn("cursor-pointer text-left", className)}
            type="button"
            {...props}
        >
            {children || "ออกจากระบบ"}
        </button>
    )
}
