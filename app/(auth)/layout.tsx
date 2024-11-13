
import '.././globals.css'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (

        <html lang="en">
            <body className={inter.className}>
                <div className="flex items-center justify-center min-h-max bg-gray-100">
                    <div className="p-8 bg-white rounded shadow-md">
                        {children}
                    </div>
                </div>
            </body>
        </html>

    )
}