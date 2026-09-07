import { ApiOutlined, CloseOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApiError } from '../../context/ApiErrorContext';
import { classifyStatus } from '../../hooks/useApiErrorInterceptor';

const DEVELOPER_WHATSAPP = '8801600012582';

function buildWhatsAppUrl(ev) {
    const { status, method, endpoint, message, pagePath, pageLabel, timestamp } = ev;
    const { label: statusLabel } = classifyStatus(status);
    const time = new Date(timestamp).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

    const lines = [
        '🔴 *API Error Report*',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        '📡 *Failed Request*',
        `• Method   : ${method}`,
        `• Endpoint : ${endpoint}`,
        `• Status   : ${statusLabel}`,
        `• Message  : ${message}`,
        '',
        '📍 *Where it happened*',
        `• Page     : ${pageLabel || pagePath}`,
        `• Path     : ${pagePath}`,
        `• Full URL : ${window.location.origin}${pagePath}`,
        '',
        '🕐 *Context*',
        `• Time (BD): ${time}`,
        `• Browser  : ${navigator.userAgent.substring(0, 80)}...`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        `Hi Developer 👋, the *${pageLabel || pagePath}* page is hitting a broken API endpoint.`,
        `The ${method} request to \`${endpoint}\` is returning *${status}*.`,
        'Please check the backend route/controller and fix it.',
        'Thank you! 🙏',
    ];

    return `https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
}

const WhatsAppIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
        width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.826.737 5.484 2.027 7.8L0 32l8.395-2.002A15.933 15.933 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.091a13.043 13.043 0 0 1-6.648-1.817l-.477-.284-4.945 1.18 1.233-4.784-.312-.49A13.04 13.04 0 0 1 2.91 16C2.91 9.317 8.317 3.91 16 3.91S29.091 9.317 29.091 16 23.683 29.091 16 29.091zm7.153-9.773c-.393-.196-2.324-1.147-2.685-1.278-.361-.13-.624-.196-.886.196-.262.392-1.016 1.278-1.245 1.54-.229.261-.458.294-.85.098-.393-.196-1.659-.612-3.16-1.95-1.168-1.043-1.957-2.33-2.186-2.722-.229-.392-.024-.604.172-.799.177-.175.393-.458.589-.687.196-.229.261-.392.393-.654.13-.261.065-.49-.033-.687-.098-.196-.886-2.136-1.213-2.923-.32-.768-.644-.664-.886-.676-.229-.012-.49-.014-.752-.014a1.44 1.44 0 0 0-1.046.49c-.36.392-1.377 1.344-1.377 3.278s1.41 3.8 1.607 4.063c.196.261 2.775 4.237 6.723 5.94.94.406 1.674.648 2.247.83.943.3 1.803.257 2.483.156.757-.113 2.324-.95 2.652-1.868.327-.917.327-1.702.229-1.868-.098-.163-.36-.261-.752-.457z"/>
    </svg>
);

const STYLES = `
  @keyframes aeo-slide-in {
    from { opacity: 0; transform: translateY(-100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aeo-fade-backdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes aeo-orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(40px,-25px) scale(1.08); }
  }
  @keyframes aeo-orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-35px,35px) scale(0.92); }
  }
  @keyframes aeo-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes aeo-pulse-dot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.5; transform: scale(1.3); }
  }
  @keyframes aeo-bar {
    from { width: 100%; }
    to   { width: 0%; }
  }

  .aeo-btn-wa:hover   { opacity: 0.88 !important; transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(37,211,102,0.45) !important; }
  .aeo-btn-dismiss:hover { background: rgba(255,255,255,0.14) !important; }
  .aeo-btn-reload:hover  { background: rgba(255,255,255,0.14) !important; }
  .aeo-copy-btn:hover    { color: #a5b4fc !important; }

  .aeo-pill code { font-family: "Fira Code","Cascadia Code",monospace; }

  @media (max-width: 640px) {
    .aeo-actions { flex-direction: column !important; }
    .aeo-actions > * { width: 100% !important; justify-content: center !important; }
    .aeo-meta-row { flex-direction: column !important; gap: 6px !important; }
  }
`;

const AUTO_DISMISS_SEC = 20;

export default function ApiErrorOverlay() {
    const { errorEvent, dismissApiError } = useApiError();
    const timerRef = useRef(null);
    const barRef   = useRef(null);

    useEffect(() => {
        if (!errorEvent) return;

        if (barRef.current) {
            barRef.current.style.animation = 'none';
            void barRef.current.offsetWidth;
            barRef.current.style.animation = `aeo-bar ${AUTO_DISMISS_SEC}s linear forwards`;
        }

        timerRef.current = setTimeout(dismissApiError, AUTO_DISMISS_SEC * 1000);
        return () => clearTimeout(timerRef.current);
    }, [errorEvent, dismissApiError]);

    if (!errorEvent) return null;

    const { status, method, endpoint, message, pagePath, pageLabel } = errorEvent;
    const { label: statusLabel, color: statusColor, emoji } = classifyStatus(status);
    const whatsAppUrl = buildWhatsAppUrl(errorEvent);
    const errorId     = Date.now().toString(36).toUpperCase();

    const handleCopy = () => {
        navigator.clipboard?.writeText(endpoint).catch(() => {});
    };

    return createPortal(
        <>
            <style>{STYLES}</style>

            <div
                onClick={dismissApiError}
                style={{
                    position        : 'fixed',
                    inset           : 0,
                    zIndex          : 2147483640,
                    background      : 'rgba(0,0,0,0.65)',
                    backdropFilter  : 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    animation       : 'aeo-fade-backdrop 0.3s ease both',
                }}
            />

            <div style={{
                position        : 'fixed',
                top             : 0,
                left            : '50%',
                transform       : 'translateX(-50%)',
                zIndex          : 2147483647,
                width           : 'min(96vw, 700px)',
                animation       : 'aeo-slide-in 0.4s cubic-bezier(.22,1,.36,1) both',
                overflow        : 'hidden',
                borderRadius    : '0 0 20px 20px',
            }}>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                    <div
                        ref={barRef}
                        style={{
                            position    : 'absolute',
                            top         : 0, left: 0,
                            height      : '100%',
                            width       : '100%',
                            background  : `linear-gradient(90deg, ${statusColor}, #a855f7)`,
                            borderRadius: 2,
                            transformOrigin: 'left',
                        }}
                    />
                </div>

                <div style={{
                    background          : 'rgba(15, 12, 41, 0.96)',
                    backdropFilter      : 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border              : `1px solid ${statusColor}33`,
                    borderTop           : 'none',
                    padding             : 'clamp(16px,3vw,28px)',
                    position            : 'relative',
                    overflow            : 'hidden',
                }}>

                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                        <div style={{
                            position    : 'absolute', top: '-40%', right: '-5%',
                            width       : 280, height: 280, borderRadius: '50%',
                            background  : `radial-gradient(circle, ${statusColor}18 0%, transparent 70%)`,
                            animation   : 'aeo-orb1 10s ease-in-out infinite',
                        }} />
                        <div style={{
                            position    : 'absolute', bottom: '-50%', left: '-5%',
                            width       : 220, height: 220, borderRadius: '50%',
                            background  : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                            animation   : 'aeo-orb2 13s ease-in-out infinite',
                        }} />
                        <div style={{
                            position        : 'absolute', inset: 0,
                            backgroundImage : 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px, transparent 1px)',
                            backgroundSize  : '32px 32px',
                        }} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>

                            <div style={{
                                width           : 44, height: 44, flexShrink: 0,
                                borderRadius    : '50%',
                                background      : `linear-gradient(135deg, ${statusColor}, #7c3aed)`,
                                display         : 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow       : `0 6px 20px ${statusColor}44`,
                                fontSize        : 20,
                            }}>
                                <ApiOutlined style={{ color: '#fff', fontSize: 20 }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 16 }}>{emoji}</span>
                                    <span style={{
                                        color       : '#fff',
                                        fontSize    : 'clamp(13px,2vw,15px)',
                                        fontWeight  : 700,
                                        letterSpacing: '-0.2px',
                                    }}>
                                        API Error Detected
                                    </span>
                                    <span style={{
                                        background      : `${statusColor}22`,
                                        border          : `1px solid ${statusColor}55`,
                                        color           : statusColor,
                                        fontSize        : 11,
                                        fontWeight      : 700,
                                        padding         : '2px 8px',
                                        borderRadius    : 100,
                                        letterSpacing   : '0.04em',
                                        whiteSpace      : 'nowrap',
                                    }}>
                                        {statusLabel}
                                    </span>
                                </div>
                                <p style={{
                                    color   : 'rgba(255,255,255,0.45)',
                                    fontSize: 12, margin: '3px 0 0',
                                }}>
                                    Developer issue — an API call is returning an error on this page
                                </p>
                            </div>

                            <button
                                onClick={dismissApiError}
                                style={{
                                    background  : 'rgba(255,255,255,0.07)',
                                    border      : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 8,
                                    color       : 'rgba(255,255,255,0.6)',
                                    width       : 30, height: 30,
                                    display     : 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor      : 'pointer', flexShrink: 0,
                                    transition  : 'background 0.2s',
                                }}
                            >
                                <CloseOutlined style={{ fontSize: 12 }} />
                            </button>
                        </div>

                        <div style={{
                            height      : 1,
                            background  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                            marginBottom: 16,
                        }} />

                        <div style={{
                            background      : 'rgba(0,0,0,0.3)',
                            border          : `1px solid ${statusColor}22`,
                            borderRadius    : 12,
                            padding         : '12px 14px',
                            marginBottom    : 14,
                        }}>
                            <div style={{
                                display         : 'flex',
                                alignItems      : 'center',
                                gap             : 8,
                                marginBottom    : 8,
                                flexWrap        : 'wrap',
                            }}>
                                <span style={{
                                    background      : method === 'GET' ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)',
                                    border          : `1px solid ${method === 'GET' ? 'rgba(34,197,94,0.4)' : 'rgba(249,115,22,0.4)'}`,
                                    color           : method === 'GET' ? '#4ade80' : '#fb923c',
                                    fontSize        : 10, fontWeight: 700, padding: '2px 8px',
                                    borderRadius    : 100, letterSpacing: '0.08em', flexShrink: 0,
                                }}>
                                    {method}
                                </span>

                                <code style={{
                                    color           : 'rgba(255,255,255,0.75)',
                                    fontSize        : 12,
                                    fontFamily      : '"Fira Code","Cascadia Code",monospace',
                                    wordBreak       : 'break-all',
                                    flex            : 1,
                                    minWidth        : 0,
                                }}>
                                    {endpoint}
                                </code>

                                <Tooltip title="Copy endpoint" color="#1a1a3e">
                                    <button
                                        className="aeo-copy-btn"
                                        onClick={handleCopy}
                                        style={{
                                            background  : 'none', border: 'none',
                                            color       : 'rgba(255,255,255,0.3)',
                                            cursor      : 'pointer', padding: '2px 4px',
                                            transition  : 'color 0.2s', flexShrink: 0,
                                        }}
                                    >
                                        <CopyOutlined style={{ fontSize: 13 }} />
                                    </button>
                                </Tooltip>
                            </div>

                            {message && (
                                <p style={{
                                    color       : `${statusColor}cc`,
                                    fontSize    : 12, margin: 0,
                                    lineHeight  : 1.5,
                                    display     : 'flex', alignItems: 'flex-start', gap: 6,
                                }}>
                                    <span style={{ flexShrink: 0 }}>⟶</span>
                                    <span>{message}</span>
                                </p>
                            )}
                        </div>

                        <div
                            className="aeo-meta-row"
                            style={{
                                display         : 'flex',
                                gap             : 12,
                                marginBottom    : 16,
                                flexWrap        : 'wrap',
                            }}
                        >
                            <div style={{
                                flex            : 1,
                                background      : 'rgba(99,102,241,0.08)',
                                border          : '1px solid rgba(99,102,241,0.2)',
                                borderRadius    : 10, padding: '8px 12px',
                                minWidth        : 140,
                            }}>
                                <p style={{ color: '#818cf8', fontSize: 10, fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    📍 Page
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: 0, wordBreak: 'break-word' }}>
                                    {pageLabel || pagePath}
                                    <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>
                                        ({pagePath})
                                    </span>
                                </p>
                            </div>

                            <div style={{
                                background      : 'rgba(255,255,255,0.04)',
                                border          : '1px solid rgba(255,255,255,0.08)',
                                borderRadius    : 10, padding: '8px 12px',
                                minWidth        : 120,
                            }}>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    🔖 Error ID
                                </p>
                                <code style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                                    {errorId}
                                </code>
                            </div>
                        </div>

                        <div className="aeo-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                className="aeo-btn-reload"
                                onClick={() => window.location.reload()}
                                style={{
                                    display         : 'flex', alignItems: 'center', gap: 6,
                                    background      : 'rgba(255,255,255,0.07)',
                                    border          : '1px solid rgba(255,255,255,0.12)',
                                    borderRadius    : 10,
                                    color           : 'rgba(255,255,255,0.75)',
                                    fontSize        : 13, fontWeight: 600,
                                    padding         : '9px 18px',
                                    cursor          : 'pointer',
                                    transition      : 'background 0.2s',
                                    flex            : '0 0 auto',
                                }}
                            >
                                <ReloadOutlined style={{ fontSize: 13 }} />
                                Reload
                            </button>

                            <button
                                className="aeo-btn-dismiss"
                                onClick={dismissApiError}
                                style={{
                                    display         : 'flex', alignItems: 'center', gap: 6,
                                    background      : 'rgba(255,255,255,0.04)',
                                    border          : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius    : 10,
                                    color           : 'rgba(255,255,255,0.4)',
                                    fontSize        : 13, fontWeight: 600,
                                    padding         : '9px 18px',
                                    cursor          : 'pointer',
                                    transition      : 'background 0.2s',
                                    flex            : '0 0 auto',
                                }}
                            >
                                Dismiss
                            </button>

                            <div style={{ flex: 1 }} />

                            <a
                                className="aeo-btn-wa"
                                href={whatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display         : 'flex', alignItems: 'center', gap: 8,
                                    background      : '#25D366',
                                    border          : 'none',
                                    borderRadius    : 10,
                                    color           : '#fff',
                                    fontSize        : 13, fontWeight: 700,
                                    padding         : '9px 18px',
                                    cursor          : 'pointer',
                                    textDecoration  : 'none',
                                    transition      : 'opacity 0.2s, transform 0.2s, box-shadow 0.2s',
                                    boxShadow       : '0 4px 14px rgba(37,211,102,0.3)',
                                    flex            : '0 0 auto',
                                    whiteSpace      : 'nowrap',
                                }}
                            >
                                <WhatsAppIcon size={16} />
                                Contact Developer
                            </a>
                        </div>

                        <p style={{
                            color       : 'rgba(255,255,255,0.18)',
                            fontSize    : 10,
                            marginTop   : 12,
                            marginBottom: 0,
                            textAlign   : 'right',
                        }}>
                            Auto-dismisses in {AUTO_DISMISS_SEC}s · Click backdrop to close
                        </p>

                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
