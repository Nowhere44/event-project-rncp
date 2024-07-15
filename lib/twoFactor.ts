import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export function generateSecret(email: string) {
    return speakeasy.generateSecret({
        name: `VotreApp:${email}`,
        length: 32
    });
}

export function verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 4
    });
}

export async function generateQRCode(secret: string) {
    try {
        const url = speakeasy.otpauthURL({
            secret: secret,
            label: 'VotreApp',
            algorithm: 'sha1',
            encoding: 'base32'
        });
        return await QRCode.toDataURL(url);
    } catch (err) {
        console.error('Erreur lors de la génération du QR code:', err);
        return null;
    }
}