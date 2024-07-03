// chat/_components/GifSearch.tsx
import React, { useState } from 'react';

interface GifSearchProps {
    onSend: (gifUrl: string) => void;
}

const GifSearch: React.FC<GifSearchProps> = ({ onSend }) => {
    const [gifSearchTerm, setGifSearchTerm] = useState('');
    const [gifs, setGifs] = useState<any[]>([]);

    const searchGifs = async () => {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${gifSearchTerm}&limit=10`);
        const data = await response.json();
        setGifs(data.data);
    };

    return (
        <div className="mt-2">
            <input
                type="text"
                value={gifSearchTerm}
                onChange={(e) => setGifSearchTerm(e.target.value)}
                placeholder="Search for GIFs"
                className="p-2 border rounded w-full"
            />
            <button onClick={searchGifs} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Search</button>
            <div className="flex flex-wrap mt-2">
                {gifs.map((gif) => (
                    <img
                        key={gif.id}
                        src={gif.images.fixed_height_small.url}
                        alt="GIF"
                        className="m-1 cursor-pointer"
                        onClick={() => onSend(gif.images.original.url)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GifSearch;