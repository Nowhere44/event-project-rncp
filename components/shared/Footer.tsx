import Link from "next/link"

const Footer = () => {
    return (
        <footer className="bg-white border-t">
            <div className="wrapper flex flex-col md:flex-row justify-between items-center gap-4 py-8 px-6 md:px-10">
                <Link href='/' className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-orange-500">Evy</span>
                </Link>
                <p className="text-sm text-gray-600">© 2024 Evy. Tous droits réservés.<span className="font-bold">(Omar Almoctar COULIBALY)</span></p>
            </div>
        </footer>
    )
}

export default Footer