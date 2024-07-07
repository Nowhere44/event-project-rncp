import { Suspense } from 'react';
import { PaymentSuccessContent } from './_components/PaymentSuccessContent';

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Vérification du paiement en cours...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}