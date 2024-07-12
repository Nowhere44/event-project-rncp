'use client';
import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoCallProps {
    roomName: string;
    displayName: string;
    email: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomName, displayName, email }) => {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                userInfo={{ displayName, email }}
                configOverwrite={{
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    prejoinPageEnabled: false
                }}
                getIFrameRef={(iframeRef) => {
                    if (iframeRef) {
                        iframeRef.style.height = '100%';
                    }
                }}
            />
        </div>
    );
};

export default VideoCall;