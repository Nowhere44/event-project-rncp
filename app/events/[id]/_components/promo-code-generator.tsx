'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PromoCode {
    id: string;
    code: string;
    discount: number;
    used: boolean;
    usedAt?: string;
    usedByUser?: {
        first_name: string;
        last_name: string;
    };
}

interface PromoCodeGeneratorProps {
    eventId: string;
}

const PromoCodeGenerator: React.FC<PromoCodeGeneratorProps> = ({ eventId }) => {
    const [promoQuantity, setPromoQuantity] = useState(1);
    const [promoDiscount, setPromoDiscount] = useState(5);
    const [generatedCodes, setGeneratedCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGeneratePromoCodes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/events/${eventId}/promo-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: promoQuantity, discount: promoDiscount }),
            });
            if (response.ok) {
                const data = await response.json();
                setGeneratedCodes(prevCodes => [...prevCodes, ...data.promoCodes]);
            } else {
                throw new Error('Échec de la génération des codes promo');
            }
        } catch (error) {
            console.error('Erreur lors de la génération des codes promo:', error);
            alert('Erreur lors de la génération des codes promo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchExistingCodes = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/promo-codes`);
                if (response.ok) {
                    const data = await response.json();
                    setGeneratedCodes(data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des codes promo existants:', error);
            }
        };

        fetchExistingCodes();
    }, [eventId]);

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Générer des codes promo</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="promoQuantity" className="block text-sm font-medium text-gray-700">
                        Nombre de codes
                    </label>
                    <input
                        type="number"
                        id="promoQuantity"
                        min="1"
                        value={promoQuantity}
                        onChange={(e) => setPromoQuantity(parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Quantité de codes à générer"
                    />
                </div>
                <div>
                    <label htmlFor="promoDiscount" className="block text-sm font-medium text-gray-700">
                        Réduction (%)
                    </label>
                    <input
                        type="number"
                        id="promoDiscount"
                        min="5"
                        max="50"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Pourcentage de réduction"
                    />
                </div>
                <Button
                    onClick={handleGeneratePromoCodes}
                    disabled={isLoading}
                    className="w-full justify-center"
                >
                    {isLoading ? 'Génération...' : 'Générer les codes'}
                </Button>
            </div>
            {generatedCodes.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Codes générés :</h4>
                    <ul className="divide-y divide-gray-200">
                        {generatedCodes.map((code) => (
                            <li key={code.id} className={`py-3 ${code.used ? 'text-gray-500' : ''}`}>
                                <div className="flex justify-between">
                                    <span className="font-medium">{code.code}</span>
                                    <span>{code.discount}% de réduction</span>
                                </div>
                                {code.used && (
                                    <div className="mt-1 text-xs">
                                        Utilisé par {code.usedByUser?.first_name} {code.usedByUser?.last_name}
                                        {code.usedAt && ` le ${new Date(code.usedAt).toLocaleString('fr-FR')}`}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PromoCodeGenerator;