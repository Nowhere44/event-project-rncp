import Image from "next/image"
import Link from "next/link"

const Footer = () => {
    return (
        <footer className="bg-white border-t">
            <div className="wrapper flex flex-col md:flex-row justify-between items-center gap-4 py-8 px-6 md:px-10">
                <Link href='/' className="flex items-center space-x-2">
                    <Image
                        src="/assets/images/diamond-removebg-preview.png"
                        alt="logo"
                        width={40}
                        height={40}
                        className="w-auto h-10"
                    />
                    <span className="text-xl font-bold text-gray-800">Evy</span>
                </Link>
                <p className="text-sm text-gray-600">© 2024 Event Connect. Tous droits réservés.</p>
            </div>
        </footer>
    )
}

export default Footer