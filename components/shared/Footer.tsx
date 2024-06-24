import Image from "next/image"
import Link from "next/link"

export const Footer = () => {
    return (
        <footer className="border-t">
            <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
                <Link href='/'>
                    <Image
                        src="/assets/images/diamond-removebg-preview.png"
                        alt="logo"
                        width={60}
                        height={60}
                    />
                </Link>

                <p>2024 Event Connect . All Rights reserved.</p>
            </div>
        </footer>
    )
}

