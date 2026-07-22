import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 100);
    const t2 = setTimeout(() => setStep(2), 800);
    const t3 = setTimeout(() => setStep(3), 1400);
    const t4 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0f172a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(20,184,166,0.06) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Teal glow orb */}
      <div style={{
        position: 'absolute',
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
        top: '30%',
      }} />

      {/* Logo */}
      <div style={{
        opacity: step >= 1 ? 1 : 0,
        transform: step >= 1 ? 'scale(1)' : 'scale(0.5)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        marginBottom: 24,
      }}>
        <img
          src="/LOGO.png"
          alt="WEBGENZ"
          style={{ width: 88, height: 88, borderRadius: 24, objectFit: 'contain' }}
        />
        {/* Ripple rings */}
        {step >= 1 && (
          <>
            <span className="splash-ripple" style={{ animationDelay: '0s' }} />
            <span className="splash-ripple" style={{ animationDelay: '0.6s' }} />
            <span className="splash-ripple" style={{ animationDelay: '1.2s' }} />
          </>
        )}
      </div>

      {/* Brand text */}
      <div style={{
        opacity: step >= 2 ? 1 : 0,
        transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out',
        textAlign: 'center',
        marginBottom: 48,
      }}>
        <h1 style={{
          color: 'white',
          fontSize: 36, fontWeight: 800,
          letterSpacing: 4,
          margin: 0,
          textShadow: '0 0 30px rgba(20,184,166,0.3)',
        }}>
          WEBGENZ
        </h1>
        <p style={{
          color: '#14b8a6',
          fontSize: 28, fontWeight: 700,
          letterSpacing: 12,
          margin: '-4px 0 0 0',
        }}>
          ABSENSI
        </p>
        <p style={{
          color: '#64748b', fontSize: 12, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: 4,
          marginTop: 8,
        }}>
          Sistem Absensi Modern
        </p>
      </div>

      {/* Loading bar - dipisah dengan margin agar tidak tumpang tindih */}
      <div style={{
        opacity: step >= 3 ? 1 : 0,
        transition: 'opacity 0.4s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 192, height: 3,
          background: '#1e293b',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div className="splash-load-bar" style={{
            height: '100%',
            background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
            borderRadius: 2,
          }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="splash-dot" style={{ animationDelay: '0s' }} />
          <span className="splash-dot" style={{ animationDelay: '0.2s' }} />
          <span className="splash-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Footer */}
      <p style={{
        position: 'absolute', bottom: 60,
        color: '#334155', fontSize: 12,
        fontFamily: "'Geist Mono', monospace",
      }}>
        v1.0.0
      </p>
    </div>
  );
}
