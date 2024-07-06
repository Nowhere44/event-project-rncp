import Image from "next/image";
import RegisterForm from './_components/register-form';

export default function RegisterPage() {
    return (
        <div className="w-full lg:grid lg:grid-cols-2 h-full">
            <div className="flex items-center justify-center py-12">
                <RegisterForm />
            </div>
            <div className="hidden bg-muted lg:block">
                <Image
                    src="https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Image"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}