//app/register/page.tsx
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
                    src="https://cdn.discordapp.com/attachments/1260248323760328820/1260303163928350740/gamer120857_A_vibrant_and_engaging_illustration_for_an_event_ma_8612a233-c8f2-4d5c-8291-f64da80520c4.png?ex=668ed449&is=668d82c9&hm=68f56029cd29065a2b3e8b06301ccc34a3ffb1775184dbcca91667af9848c9f5&"
                    alt="Image"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"

                />
            </div>
        </div>
    );
}