'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PromoCode {
    id: string;
    code: string;
    discount: number;
    used: boolean;
    usedBy?: string;
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
                setGeneratedCodes(data.promoCodes);
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
        <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Générer des codes promo</h3>
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="number"
                    min="1"
                    value={promoQuantity}
                    onChange={(e) => setPromoQuantity(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                    placeholder="Quantité"
                />
                <input
                    type="number"
                    min="5"
                    max="50"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                    placeholder="Réduction %"
                />
                <Button onClick={handleGeneratePromoCodes} disabled={isLoading}>
                    {isLoading ? 'Génération...' : 'Générer'}
                </Button>
            </div>
            {generatedCodes.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-2">Codes générés :</h4>
                    <ul className="list-disc pl-5">
                        {generatedCodes.map((code) => (
                            <li key={code.id} className={code.used ? 'line-through text-gray-500' : ''}>
                                {code.code} - {code.discount}% de réduction
                                {code.used && code.usedBy && (
                                    <span className="ml-2 text-sm text-gray-500">
                                        (Utilisé par {code.usedBy}
                                        {code.usedAt && ` le ${new Date(code.usedAt).toLocaleDateString()}`})
                                        {code.used && code.usedByUser && (
                                            <span className="ml-2 text-sm text-gray-500">
                                                (Utilisé par {code.usedByUser.first_name} {code.usedByUser.last_name})
                                            </span>
                                        )}
                                    </span>
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