function CollapsibleSettingsMenu({ pathname }: { pathname: string }) {
    const [isOpen, setIsOpen] = useState(pathname.includes('/settings'))

    // Auto-open if visiting a settings page
    if (pathname.includes('/settings') && !isOpen) {
        setIsOpen(true)
    }

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${pathname.includes('/settings') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    ตั้งค่า
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="pl-11 space-y-1">
                    <Link
                        href="/dashboard/settings?tab=general"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings') && (pathname.includes('tab=general') || !pathname.includes('tab=')) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        ข้อมูลหอพัก
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=finance"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('tab=finance') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การเงินและบัญชี
                    </Link>
                    <Link
                        href="/dashboard/settings?tab=notification"
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.includes('tab=notification') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        การแจ้งเตือน
                    </Link>
                </div>
            )}
        </div>
    )
}
