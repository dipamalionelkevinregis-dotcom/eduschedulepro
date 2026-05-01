import { useRef, useEffect, useState } from 'react';

/**
 * QRScanner — lit la caméra et détecte les QR codes via l'API BarcodeDetector
 * Fallback : saisie manuelle du token
 */
export default function QRScanner({ onScan, onClose }) {
    const videoRef = useRef(null);
    const [manualToken, setManualToken] = useState('');
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        let stream;
        let interval;

        const start = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setScanning(true);

                if ('BarcodeDetector' in window) {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    interval = setInterval(async () => {
                        try {
                            const codes = await detector.detect(videoRef.current);
                            if (codes.length > 0) {
                                clearInterval(interval);
                                stream.getTracks().forEach(t => t.stop());
                                onScan(codes[0].rawValue);
                            }
                        } catch {}
                    }, 500);
                } else {
                    setError('BarcodeDetector non supporté — utilise la saisie manuelle.');
                }
            } catch (err) {
                setError('Caméra inaccessible — utilise la saisie manuelle.');
            }
        };

        start();
        return () => {
            clearInterval(interval);
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [onScan]);

    return (
        <div className="text-center">
            <video ref={videoRef} style={{ width: '100%', maxHeight: '300px', background: '#000', borderRadius: '8px' }} muted />
            {error && <div className="alert alert-warning mt-2 py-2 small">{error}</div>}
            {scanning && !error && <p className="text-muted small mt-2">📷 Positionnez le QR code devant la caméra…</p>}

            <hr />
            <p className="fw-bold small">Ou saisie manuelle du token</p>
            <div className="input-group">
                <input
                    className="form-control"
                    placeholder="Collez le token QR ici"
                    value={manualToken}
                    onChange={e => setManualToken(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    disabled={!manualToken.trim()}
                    onClick={() => onScan(manualToken.trim())}
                >
                    ✅ Valider
                </button>
            </div>
        </div>
    );
}