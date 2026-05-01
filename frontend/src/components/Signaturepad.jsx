import { useRef, useState } from 'react';

export default function SignaturePad({ onSave, onCancel }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    };

    const start = (e) => {
        setDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1a3a5c';
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stop = () => setDrawing(false);

    const clear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const save = () => {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div>
            <p className="text-muted small mb-2">Signez dans le cadre ci-dessous :</p>
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                style={{ border: '1px solid #ccc', borderRadius: '8px', cursor: 'crosshair', touchAction: 'none', width: '100%' }}
                onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
                onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
            />
            <div className="d-flex gap-2 mt-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={clear}>🗑 Effacer</button>
                <button className="btn btn-success btn-sm ms-auto" onClick={save}>✅ Valider la signature</button>
                <button className="btn btn-outline-danger btn-sm" onClick={onCancel}>Annuler</button>
            </div>
        </div>
    );
}