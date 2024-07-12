import React from 'react';
import Image from 'next/image';

interface EventImageGalleryProps {
    images: string[] | { url: string; order: number }[];
}
const EventImageGallery: React.FC<EventImageGalleryProps> = ({ images }) => {
    const sortedImages = images.map(img => typeof img === 'string' ? img : img.url)
        .filter(Boolean);

    if (sortedImages.length === 0) return null;

    if (sortedImages.length === 1) {
        return (
            <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
                <Image
                    src={sortedImages[0]}
                    alt="Event image"
                    className="w-full h-full object-cover"
                    width={800}
                    height={400}
                    layout="responsive"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 row-span-2">
                <Image
                    src={sortedImages[0]}
                    alt="Main event image"
                    className="w-full h-full object-cover"
                    width={800}
                    height={400}
                    layout="responsive"
                />
            </div>
            {sortedImages.slice(1, 5).map((image, index) => (
                <div key={index} className={index === 3 && sortedImages.length > 5 ? "relative" : ""}>
                    <Image
                        src={image}
                        alt={`Event image ${index + 2}`}
                        className="w-full h-full object-cover"
                        width={400}
                        height={200}
                        layout="responsive"
                    />
                    {index === 3 && sortedImages.length > 5 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl">
                            +{sortedImages.length - 5}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default EventImageGallery;