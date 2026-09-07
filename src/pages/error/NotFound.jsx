import { HomeOutlined, QuestionCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { findNearestRoute, KNOWN_ROUTES } from '../../hooks/useNearestRoute';

const { Text } = Typography;

const DEVELOPER_WHATSAPP = '8801600012582';

function resolvePageLabel(pathname) {
    if (!pathname) return null;
    const exact = KNOWN_ROUTES.find(r => r.path === pathname);
    if (exact) return exact.label;
    const nearest = findNearestRoute(pathname);
    return nearest ? nearest.label : pathname;
}

function detectArrivalMethod(referrer, locationState) {
    if (locationState?.fromAction) return locationState.fromAction;
    if (locationState?.from)       return `Navigated from: ${locationState.from}`;
    if (referrer) {
        try {
            const ref = new URL(referrer);
            if (ref.origin === window.location.origin)
                return `Internal navigation from: ${ref.pathname}`;
            return `External referrer: ${ref.href}`;
        } catch (_) { /* ignore */ }
    }
    return 'Direct URL entry / browser address bar';
}

function buildWhatsAppUrl({ pathname, locationState }) {
    const wrongUrl      = window.location.href;
    const referrer      = document.referrer;
    const referrerLabel = referrer ? resolvePageLabel(new URL(referrer).pathname) : null;
    const arrivalMethod = detectArrivalMethod(referrer, locationState);
    const nearest       = findNearestRoute(pathname);
    const time          = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
    const browser       = navigator.userAgent.split(' ').slice(-2).join(' ');

    const fromPage   = locationState?.fromPage  || referrerLabel || '(unknown)';
    const fromAction = locationState?.fromAction || null;

    const lines = [
        '🚨 *404 — Page Not Found Report*',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        '📋 *Error Details*',
        `• Wrong path tried  : \`${pathname}\``,
        `• Full URL          : ${wrongUrl}`,
        nearest
            ? `• Correct path likely: \`${nearest.path}\` (${nearest.label})`
            : '• No close match found in route registry',
        '',
        '🔍 *How did this happen?*',
        `• Came from page    : ${fromPage}`,
        fromAction
            ? `• Action triggered  : ${fromAction}`
            : `• Navigation method : ${arrivalMethod}`,
        '',
        '🕐 *Context*',
        `• Time (BD)  : ${time}`,
        `• Browser    : ${browser}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        'Hi Developer 👋, a user hit a broken route in the app.',
        'Please investigate and fix the navigation issue above.',
        'Thank you! 🙏',
    ];

    return `https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
}

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────
const WhatsAppIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
        width={size} height={size} fill="currentColor"
        style={{ flexShrink: 0 }}>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.826.737 5.484 2.027 7.8L0 32l8.395-2.002A15.933 15.933 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.091a13.043 13.043 0 0 1-6.648-1.817l-.477-.284-4.945 1.18 1.233-4.784-.312-.49A13.04 13.04 0 0 1 2.91 16C2.91 9.317 8.317 3.91 16 3.91S29.091 9.317 29.091 16 23.683 29.091 16 29.091zm7.153-9.773c-.393-.196-2.324-1.147-2.685-1.278-.361-.13-.624-.196-.886.196-.262.392-1.016 1.278-1.245 1.54-.229.261-.458.294-.85.098-.393-.196-1.659-.612-3.16-1.95-1.168-1.043-1.957-2.33-2.186-2.722-.229-.392-.024-.604.172-.799.177-.175.393-.458.589-.687.196-.229.261-.392.393-.654.13-.261.065-.49-.033-.687-.098-.196-.886-2.136-1.213-2.923-.32-.768-.644-.664-.886-.676-.229-.012-.49-.014-.752-.014a1.44 1.44 0 0 0-1.046.49c-.36.392-1.377 1.344-1.377 3.278s1.41 3.8 1.607 4.063c.196.261 2.775 4.237 6.723 5.94.94.406 1.674.648 2.247.83.943.3 1.803.257 2.483.156.757-.113 2.324-.95 2.652-1.868.327-.917.327-1.702.229-1.868-.098-.163-.36-.261-.752-.457z"/>
    </svg>
);

// ─── Keyframe injection ───────────────────────────────────────────────────────
const STYLES = `
  @keyframes nf-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-18px) rotate(3deg); }
    66%       { transform: translateY(-10px) rotate(-2deg); }
  }
  @keyframes nf-pulse-ring {
    0%   { transform: scale(0.8); opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes nf-slide-up {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nf-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes nf-orb1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(60px, -40px) scale(1.1); }
  }
  @keyframes nf-orb2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-50px, 50px) scale(0.9); }
  }
  @keyframes nf-orb3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(30px, 30px) scale(1.15); }
  }
  @keyframes nf-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes nf-count {
    from { opacity: 0; letter-spacing: 0.5em; }
    to   { opacity: 1; letter-spacing: normal; }
  }

  .nf-card {
    animation: nf-slide-up 0.55s cubic-bezier(.22,1,.36,1) both;
  }
  .nf-card:nth-child(2) { animation-delay: 0.1s; }
  .nf-card:nth-child(3) { animation-delay: 0.2s; }
  .nf-card:nth-child(4) { animation-delay: 0.3s; }

  .nf-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(99,102,241,0.45) !important;
  }
  .nf-btn-ghost:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
  }
  .nf-btn-wa:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(37,211,102,0.45) !important;
    background: #20c05a !important;
  }
  .nf-suggest-card:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
  }

  @media (max-width: 640px) {
    .nf-404-text { font-size: clamp(80px, 22vw, 140px) !important; }
    .nf-title    { font-size: 20px !important; }
    .nf-sub      { font-size: 13px !important; }
    .nf-btns     { flex-direction: column !important; }
    .nf-btns > * { width: 100% !important; }
  }
  @media (max-width: 400px) {
    .nf-404-text { font-size: 72px !important; }
  }
`;

const NotFound = () => {
    const navigate                           = useNavigate();
    const { pathname, state: locationState } = useLocation();
    const nearest                            = findNearestRoute(pathname);
    const whatsAppUrl                        = buildWhatsAppUrl({ pathname, locationState });

    return (
        <>
            <style>{STYLES}</style>

            <div style={{
                minHeight       : '100vh',
                position        : 'relative',
                overflow        : 'hidden',
                display         : 'flex',
                alignItems      : 'center',
                justifyContent  : 'center',
                padding         : '24px 16px',
                background      : 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)',
            }}>

                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <div style={{
                        position      : 'absolute',
                        top           : '-15%',
                        left          : '-10%',
                        width         : 'clamp(300px, 50vw, 600px)',
                        height        : 'clamp(300px, 50vw, 600px)',
                        borderRadius  : '50%',
                        background    : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                        animation     : 'nf-orb1 12s ease-in-out infinite',
                    }} />
                    <div style={{
                        position      : 'absolute',
                        bottom        : '-20%',
                        right         : '-10%',
                        width         : 'clamp(250px, 45vw, 550px)',
                        height        : 'clamp(250px, 45vw, 550px)',
                        borderRadius  : '50%',
                        background    : 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
                        animation     : 'nf-orb2 15s ease-in-out infinite',
                    }} />
                    <div style={{
                        position      : 'absolute',
                        top           : '40%',
                        left          : '50%',
                        transform     : 'translate(-50%,-50%)',
                        width         : 'clamp(200px, 35vw, 400px)',
                        height        : 'clamp(200px, 35vw, 400px)',
                        borderRadius  : '50%',
                        background    : 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
                        animation     : 'nf-orb3 18s ease-in-out infinite',
                    }} />
                    <div style={{
                        position        : 'absolute',
                        inset           : 0,
                        backgroundImage : 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize  : '40px 40px',
                    }} />
                </div>

                <div style={{
                    position        : 'relative',
                    zIndex          : 1,
                    width           : '100%',
                    maxWidth        : 640,
                    animation       : 'nf-fade-in 0.4s ease both',
                }}>

                    <div className="nf-card" style={{
                        background      : 'rgba(255,255,255,0.05)',
                        backdropFilter  : 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border          : '1px solid rgba(255,255,255,0.1)',
                        borderRadius    : 24,
                        padding         : 'clamp(28px, 5vw, 48px)',
                        boxShadow       : '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        textAlign       : 'center',
                    }}>

                        <div style={{
                            position        : 'relative',
                            display         : 'inline-block',
                            marginBottom    : 8,
                            animation       : 'nf-float 5s ease-in-out infinite',
                        }}>
                            <div style={{
                                position        : 'absolute',
                                inset           : '-20px',
                                borderRadius    : '50%',
                                border          : '2px solid rgba(99,102,241,0.4)',
                                animation       : 'nf-pulse-ring 2.5s ease-out infinite',
                            }} />
                            <div style={{
                                position        : 'absolute',
                                inset           : '-20px',
                                borderRadius    : '50%',
                                border          : '2px solid rgba(99,102,241,0.25)',
                                animation       : 'nf-pulse-ring 2.5s ease-out infinite 0.8s',
                            }} />
                            <div style={{
                                width           : 88,
                                height          : 88,
                                borderRadius    : '50%',
                                background      : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display         : 'flex',
                                alignItems      : 'center',
                                justifyContent  : 'center',
                                boxShadow       : '0 16px 40px rgba(99,102,241,0.5)',
                                margin          : '0 auto',
                            }}>
                                <WarningOutlined style={{ fontSize: 40, color: '#fff' }} />
                            </div>
                        </div>

                        <div
                            className="nf-404-text"
                            style={{
                                fontSize        : 'clamp(100px, 18vw, 160px)',
                                fontWeight      : 900,
                                lineHeight      : 1,
                                marginTop       : 16,
                                marginBottom    : 0,
                                background      : 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #22d3ee 100%)',
                                backgroundSize  : '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor : 'transparent',
                                backgroundClip  : 'text',
                                animation       : 'nf-shimmer 4s linear infinite, nf-count 0.6s ease both',
                                fontFamily      : '"Segoe UI", system-ui, sans-serif',
                                letterSpacing   : '-4px',
                                userSelect      : 'none',
                            }}
                        >
                            404
                        </div>

                        <h1
                            className="nf-title"
                            style={{
                                color       : '#fff',
                                fontSize    : 'clamp(18px, 3vw, 26px)',
                                fontWeight  : 700,
                                margin      : '4px 0 10px',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Oops! Page Not Found
                        </h1>

                        <p
                            className="nf-sub"
                            style={{
                                color       : 'rgba(255,255,255,0.55)',
                                fontSize    : 'clamp(13px, 2vw, 15px)',
                                margin      : '0 0 24px',
                                lineHeight  : 1.6,
                            }}
                        >
                            The path you visited doesn&apos;t exist or you may not have
                            permission to view it.
                        </p>

                        <div style={{
                            display         : 'inline-flex',
                            alignItems      : 'center',
                            gap             : 8,
                            background      : 'rgba(239,68,68,0.15)',
                            border          : '1px solid rgba(239,68,68,0.35)',
                            borderRadius    : 100,
                            padding         : '6px 16px',
                            marginBottom    : 28,
                            maxWidth        : '100%',
                            overflow        : 'hidden',
                        }}>
                            <span style={{
                                width           : 7,
                                height          : 7,
                                borderRadius    : '50%',
                                background      : '#ef4444',
                                flexShrink      : 0,
                                boxShadow       : '0 0 6px #ef4444',
                            }} />
                            <code style={{
                                color           : '#fca5a5',
                                fontSize        : 13,
                                fontFamily      : '"Fira Code", "Cascadia Code", monospace',
                                whiteSpace      : 'nowrap',
                                overflow        : 'hidden',
                                textOverflow    : 'ellipsis',
                                maxWidth        : '100%',
                            }}>
                                {pathname}
                            </code>
                        </div>

                        <div style={{
                            height          : 1,
                            background      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                            marginBottom    : 24,
                        }} />

                        {nearest && (
                            <div
                                className="nf-card nf-suggest-card"
                                style={{
                                    background      : 'rgba(99,102,241,0.12)',
                                    border          : '1px solid rgba(99,102,241,0.3)',
                                    borderRadius    : 14,
                                    padding         : '14px 18px',
                                    marginBottom    : 20,
                                    textAlign       : 'left',
                                    transition      : 'border-color 0.2s, box-shadow 0.2s',
                                    cursor          : 'default',
                                }}
                            >
                                <div style={{
                                    display         : 'flex',
                                    alignItems      : 'flex-start',
                                    gap             : 10,
                                }}>
                                    <QuestionCircleOutlined style={{
                                        color       : '#818cf8',
                                        fontSize    : 16,
                                        marginTop   : 2,
                                        flexShrink  : 0,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            color       : '#c7d2fe',
                                            fontSize    : 13,
                                            fontWeight  : 600,
                                            margin      : '0 0 6px',
                                        }}>
                                            Did you mean this page?
                                        </p>
                                        <div style={{
                                            display         : 'flex',
                                            alignItems      : 'center',
                                            gap             : 8,
                                            flexWrap        : 'wrap',
                                        }}>
                                            <code style={{
                                                background      : 'rgba(99,102,241,0.25)',
                                                color           : '#a5b4fc',
                                                padding         : '2px 8px',
                                                borderRadius    : 6,
                                                fontSize        : 12,
                                                fontFamily      : 'monospace',
                                            }}>
                                                {nearest.path}
                                            </code>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                                {nearest.label}
                                            </span>
                                            <button
                                                onClick={() => navigate(nearest.path)}
                                                style={{
                                                    marginLeft      : 'auto',
                                                    background      : 'linear-gradient(135deg,#6366f1,#a855f7)',
                                                    border          : 'none',
                                                    borderRadius    : 8,
                                                    color           : '#fff',
                                                    fontSize        : 12,
                                                    fontWeight      : 600,
                                                    padding         : '5px 14px',
                                                    cursor          : 'pointer',
                                                    whiteSpace      : 'nowrap',
                                                    transition      : 'opacity 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            >
                                                Take me there →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {locationState?.fromPage && (
                            <div
                                className="nf-card"
                                style={{
                                    background      : 'rgba(234,179,8,0.1)',
                                    border          : '1px solid rgba(234,179,8,0.25)',
                                    borderRadius    : 14,
                                    padding         : '12px 18px',
                                    marginBottom    : 20,
                                    textAlign       : 'left',
                                    display         : 'flex',
                                    gap             : 10,
                                    alignItems      : 'flex-start',
                                }}
                            >
                                <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
                                <div>
                                    <p style={{ color: '#fde68a', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
                                        Source of this error
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                                        Page: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{locationState.fromPage}</span>
                                        {locationState.fromAction && (
                                            <><br />Action: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{locationState.fromAction}</span></>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div
                            className="nf-btns"
                            style={{
                                display         : 'flex',
                                gap             : 10,
                                justifyContent  : 'center',
                                flexWrap        : 'wrap',
                            }}
                        >
                            <button
                                className="nf-btn-primary"
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    display         : 'flex',
                                    alignItems      : 'center',
                                    gap             : 8,
                                    background      : 'linear-gradient(135deg,#6366f1,#a855f7)',
                                    border          : 'none',
                                    borderRadius    : 12,
                                    color           : '#fff',
                                    fontSize        : 14,
                                    fontWeight      : 600,
                                    padding         : '12px 22px',
                                    cursor          : 'pointer',
                                    transition      : 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow       : '0 4px 16px rgba(99,102,241,0.35)',
                                    flex            : '1 1 auto',
                                    justifyContent  : 'center',
                                    minWidth        : 160,
                                }}
                            >
                                <HomeOutlined />
                                Back to Dashboard
                            </button>

                            <button
                                className="nf-btn-ghost"
                                onClick={() => navigate(-1)}
                                style={{
                                    display         : 'flex',
                                    alignItems      : 'center',
                                    gap             : 8,
                                    background      : 'rgba(255,255,255,0.08)',
                                    border          : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius    : 12,
                                    color           : 'rgba(255,255,255,0.85)',
                                    fontSize        : 14,
                                    fontWeight      : 600,
                                    padding         : '12px 22px',
                                    cursor          : 'pointer',
                                    transition      : 'transform 0.2s, box-shadow 0.2s',
                                    backdropFilter  : 'blur(8px)',
                                    flex            : '1 1 auto',
                                    justifyContent  : 'center',
                                    minWidth        : 120,
                                }}
                            >
                                ← Go Back
                            </button>

                            <Tooltip title="Opens WhatsApp with full error details pre-filled" color="#1d1d2e">
                                <a
                                    className="nf-btn-wa"
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display         : 'flex',
                                        alignItems      : 'center',
                                        gap             : 8,
                                        background      : '#25D366',
                                        border          : 'none',
                                        borderRadius    : 12,
                                        color           : '#fff',
                                        fontSize        : 14,
                                        fontWeight      : 600,
                                        padding         : '12px 22px',
                                        cursor          : 'pointer',
                                        textDecoration  : 'none',
                                        transition      : 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                                        boxShadow       : '0 4px 16px rgba(37,211,102,0.3)',
                                        flex            : '1 1 auto',
                                        justifyContent  : 'center',
                                        minWidth        : 180,
                                    }}
                                >
                                    <WhatsAppIcon size={18} />
                                    Contact Developer
                                </a>
                            </Tooltip>
                        </div>

                        <p style={{
                            color       : 'rgba(255,255,255,0.25)',
                            fontSize    : 11,
                            marginTop   : 24,
                            marginBottom: 0,
                            lineHeight  : 1.5,
                        }}>
                            Error ID: <code style={{ color: 'rgba(255,255,255,0.35)' }}>{Date.now().toString(36).toUpperCase()}</code>
                            &nbsp;·&nbsp; {new Date().toLocaleTimeString('en-BD', { timeZone: 'Asia/Dhaka' })}
                        </p>
                    </div>

                    <div style={{
                        height          : 2,
                        background      : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(168,85,247,0.8), transparent)',
                        borderRadius    : '0 0 24px 24px',
                        marginTop       : -2,
                    }} />
                </div>
            </div>
        </>
    );
};

export default NotFound;
