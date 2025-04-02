"use client"
import React from 'react';


export interface TimerData {
    id: string;
    name: string;
    time: number;
    isRunning: boolean;
    color: string;
    lastUpdate?: number; // Al iniciar, se guarda Date.now()
}


interface TimerProps {
    timer: TimerData;
    onToggle: (id: string) => void;
    onReset: (id: string) => void;
    onDelete: (id: string) => void;
}


const Timer: React.FC<TimerProps> = ({ timer, onToggle, onReset, onDelete }) => {
    const formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const hoursStr = hours > 0 ? `${hours} ${hours === 1 ? 'hora' : 'horas'} ` : '';
        const minutesStr = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} ` : '';
        const secondsStr = `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
        return `${hoursStr}${minutesStr}${secondsStr}`.trim();
    };


    return (
        <div
            style={{
                textAlign: 'center',
                marginTop: '20px',
                border: '1px solid #ccc',
                padding: '10px',
                backgroundColor: timer.color,
            }}
        >
            <h2>{timer.name}</h2>
            <h1>{formatTime(timer.time)}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => onToggle(timer.id)} style={{ padding: '10px 20px', fontSize: '16px' }}>
                    {timer.isRunning ? 'Pausar' : 'Iniciar'}
                </button>
                <button onClick={() => onReset(timer.id)} style={{ padding: '10px 20px', fontSize: '16px' }}>
                    Reiniciar
                </button>
                <button onClick={() => onDelete(timer.id)} style={{ padding: '10px 20px', fontSize: '16px' }}>
                    Borrar
                </button>
            </div>
        </div>
    );
};


export default Timer;
