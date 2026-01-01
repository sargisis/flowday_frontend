export default function TacticalOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden opacity-[0.03]">
            {/* Scanlines Effect */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%'
                }}
            />
            {/* Subtle Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
        </div>
    );
}
