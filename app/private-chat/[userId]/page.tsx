'use client'
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import PrivateChat from '../_components/PrivateChat';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    first_name: string;
}

const PrivateChatPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = params.userId as string;
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (session?.user?.id && userId) {
            fetchOtherUser();
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [session, userId]);

    const fetchOtherUser = async () => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setOtherUser(data);
            }
        } catch (error) {
            console.error('Error fetching other user:', error);
        }
    };

    const initSocket = () => {
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            path: '/api/socketio',
        });

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('register', session?.user?.id);
        });
    };

    if (!session || !otherUser) {
        return <div>Loading...</div>;
    }

    return (
        <PrivateChat
            currentUserId={session.user.id}
            otherUserId={otherUser.id}
            otherUserName={otherUser.first_name}
            onClose={() => router.push('/chat')}
        />
    );
};

export default PrivateChatPage;