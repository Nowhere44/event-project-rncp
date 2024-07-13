"use client";
import React from 'react';
import Image from 'next/image';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface EventImageGalleryProps {
    images: string[] | { url: string; order: number }[];
}

const EventImageGallery: React.FC<EventImageGalleryProps> = ({ images }) => {
    const sortedImages = images.map(img => typeof img === 'string' ? img : img.url)
        .filter(Boolean);

    if (sortedImages.length === 0) return null;

    const renderImage = (src: string, alt: string) => (
        <div className="relative w-full h-full">
            <Image
                src={src}
                alt={alt}
                layout="fill"
                objectFit="cover"
            />
        </div>
    );

    if (sortedImages.length === 1) {
        return (
            <div className="w-full h-full relative">
                {renderImage(sortedImages[0], "Event image")}
            </div>
        );
    }

    if (sortedImages.length === 2) {
        return (
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={50}>{renderImage(sortedImages[0], "Event image 1")}</ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>{renderImage(sortedImages[1], "Event image 2")}</ResizablePanel>
            </ResizablePanelGroup>
        );
    }

    if (sortedImages.length === 3) {
        return (
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={50}>{renderImage(sortedImages[0], "Event image 1")}</ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={50}>{renderImage(sortedImages[1], "Event image 2")}</ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50}>{renderImage(sortedImages[2], "Event image 3")}</ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        );
    }

    // Pour 4 ou 5 images
    return (
        <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50}>{renderImage(sortedImages[0], "Event image 1")}</ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>{renderImage(sortedImages[1], "Event image 2")}</ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={33}>{renderImage(sortedImages[2], "Event image 3")}</ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={33}>{renderImage(sortedImages[3], "Event image 4")}</ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={33}>
                        {sortedImages.length > 4
                            ? renderImage(sortedImages[4], "Event image 5")
                            : <div className="w-full h-full bg-gray-200"></div>
                        }
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default EventImageGallery;