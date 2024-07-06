import React from 'react';

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-[calc(100vh-18rem)] md:h-[calc(100vh-10rem)]">
            {children}
        </div>
    );
}