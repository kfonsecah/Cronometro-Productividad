"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Timer, { TimerData } from './Timer';


function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });


    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            } catch (error) {
                console.error(error);
            }
        }
    }, [key, storedValue]);


    return [storedValue, setStoredValue] as const;
}


const getRandomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};


const TimerList: React.FC = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const [timers, setTimers] = useLocalStorage<TimerData[]>('timers', []);
    const [newTimerName, setNewTimerName] = useState('');
    // useRef para almacenar el identificador del intervalo global sin provocar render
    const intervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        setHasMounted(true);
    }, []);


    useEffect(() => {
        if (hasMounted && timers.length === 0) {
            const defaultTimers: TimerData[] = [
                { id: Date.now().toString() + "_1", name: 'Timer 1', time: 0, isRunning: false, color: getRandomColor() }
            ];
            setTimers(defaultTimers);
        }
    }, [hasMounted]);


    const addTimer = () => {
        if (newTimerName.trim() === '') return;
        const newTimer: TimerData = {
            id: Date.now().toString(),
            name: newTimerName,
            time: 0,
            isRunning: false,
            color: getRandomColor(),
        };
        setTimers([...timers, newTimer]);
        setNewTimerName('');
    };


    const toggleTimer = (id: string) => {
        setTimers(prev =>
            prev.map(timer => {
                if (timer.id === id) {
                    if (!timer.isRunning) {
                        // Al iniciar se registra el timestamp actual en lastUpdate
                        return { ...timer, isRunning: true, lastUpdate: Date.now() };
                    } else {
                        return { ...timer, isRunning: false };
                    }
                }
                return timer;
            })
        );
    };


    const resetTimer = (id: string) => {
        setTimers(prev =>
            prev.map(timer =>
                timer.id === id ? { ...timer, time: 0, isRunning: false } : timer
            )
        );
    };


    const deleteTimer = (id: string) => {
        setTimers(prev => prev.filter(timer => timer.id !== id));
    };


    // Efecto global que actualiza el tiempo de todos los timers activos cada 250ms
    useEffect(() => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTimers(prev =>
                    prev.map(timer => {
                        if (timer.isRunning) {
                            const now = Date.now();
                            const last = timer.lastUpdate || now;
                            const delta = now - last;
                            return { ...timer, time: timer.time + delta, lastUpdate: now };
                        }
                        return timer;
                    })
                );
            }, 250);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);


    // Optimización con useMemo para evitar recálculos innecesarios:
    const totalTime = useMemo(() => {
        return timers.reduce((acc, timer) => acc + timer.time, 0);
    }, [timers]);


    const segments = useMemo(() => {
        return timers.map(timer => ({
            color: timer.color,
            percentage: totalTime > 0 ? (timer.time / totalTime) * 100 : 100 / timers.length,
        }));
    }, [timers, totalTime]);


    const pieGradient = useMemo(() => {
        return segments
            .map((seg, index) => {
                const start = segments.slice(0, index).reduce((acc, s) => acc + s.percentage, 0);
                const end = start + seg.percentage;
                return `${seg.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
            })
            .join(', ');
    }, [segments]);


    return (
        <div style={{ padding: '20px' }}>
            {hasMounted && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Nombre del Timer"
                            value={newTimerName}
                            onChange={(e) => setNewTimerName(e.target.value)}
                            style={{ padding: '10px', fontSize: '16px', marginRight: '10px' }}
                        />
                        <button onClick={addTimer} style={{ padding: '10px 20px', fontSize: '16px' }}>
                            Agregar Timer
                        </button>
                    </div>


                    {timers.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                                <div>
                                    <h3 style={{ textAlign: 'center' }}>Gráfico Circular</h3>
                                    <div
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            background: `conic-gradient(${pieGradient})`,
                                            margin: '0 auto',
                                        }}
                                    ></div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ textAlign: 'center' }}>Gráfico Lineal</h3>
                                    <div style={{ height: '30px', display: 'flex', width: '100%', border: '1px solid #ccc' }}>
                                        {segments.map((seg, index) => (
                                            <div key={index} style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {timers.map(timer => (
                        <Timer
                            key={timer.id}
                            timer={timer}
                            onToggle={toggleTimer}
                            onReset={resetTimer}
                            onDelete={deleteTimer}
                        />
                    ))}
                </>
            )}
        </div>
    );
};


export default TimerList;
