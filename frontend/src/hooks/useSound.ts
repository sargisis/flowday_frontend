import { useCallback, useEffect, useRef } from 'react';

export default function useSound(url: string, volume = 0.5) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(url);
        audioRef.current.volume = volume;
    }, [url, volume]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    }, []);

    return play;
}
