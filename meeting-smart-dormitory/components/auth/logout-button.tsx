"use client"

import { logout } from "@/actions/auth-actions"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Optional: if we wanted to enforce Shadcn style

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
}

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function LogoutButton({ children, className, ...props }: LogoutButtonProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    className={cn("cursor-pointer text-left", className)}
                    type="button"
                    {...props}
                >
                    {children || "ออกจากระบบ"}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการออกจากระบบ</AlertDialogTitle>
                    <AlertDialogDescription>
                        คุณต้องการออกจากระบบใช่หรือไม่?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => logout()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        ยืนยัน (Logout)
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
