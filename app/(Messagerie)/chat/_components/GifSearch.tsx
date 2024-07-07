import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

interface GifSearchProps {
    onSend: (gifUrl: string) => void;
    onClose: () => void;
}

const GifSearch: React.FC<GifSearchProps> = ({ onSend, onClose }) => {
    const [gifSearchTerm, setGifSearchTerm] = useState('');
    const [gifs, setGifs] = useState<any[]>([]);

    useEffect(() => {
        if (gifSearchTerm.length > 2) {
            const timer = setTimeout(() => {
                searchGifs();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [gifSearchTerm]);

    const searchGifs = async () => {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${gifSearchTerm}&limit=15`);
        const data = await response.json();
        setGifs(data.data);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1 flex items-center">
                    <Search size={20} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        value={gifSearchTerm}
                        onChange={(e) => setGifSearchTerm(e.target.value)}
                        placeholder="Search for GIFs"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {gifs.map((gif) => (
                    <Image
                        key={gif.id}
                        src={gif.images.fixed_height_small.url}
                        alt="GIF"
                        className="w-full h-auto object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onSend(gif.images.original.url)}
                        width={200}
                        height={200}
                    />
                ))}
            </div>
        </div>
    );
};

export default GifSearch;