import { BugOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';

const DEVELOPER_WHATSAPP = '8801600012582';

function extractComponentName(componentStack) {
    if (!componentStack) return 'Unknown Component';
    const lines = componentStack.trim().split('\n');
    for (const line of lines) {
        const match = line.match(/at\s+([A-Z][A-Za-z0-9_.]+)\s*[\(@]/);
        if (match) return match[1];
    }
    return 'Unknown Component';
}

function buildWhatsAppUrl(error, errorInfo) {
    const time          = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
    const pageUrl       = window.location.href;
    const browser       = navigator.userAgent;
    const compName      = extractComponentName(errorInfo?.componentStack);

    const stackLines    = (error?.stack || '')
        .split('\n')
        .filter(l => l.includes('src/') || l.includes('.jsx') || l.includes('.js'))
        .filter(l => !l.includes('node_modules'))
        .slice(0, 5)
        .map(l => l.trim())
        .join('\n  ');

    const lines = [
        '🔴 *Runtime Error Report (500)*',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        '💥 *Error*',
        `• Type    : ${error?.name || 'Error'}`,
        `• Message : ${error?.message || 'Unknown error'}`,
        '',
        '📍 *Location*',
        `• Failed component : ${compName}`,
        `• Page URL         : ${pageUrl}`,
        '',
        stackLines
            ? `📂 *Stack Trace (src files)*\n  ${stackLines}`
            : '',
        '',
        '🕐 *Context*',
        `• Time (BD) : ${time}`,
        `• Browser   : ${browser.substring(0, 80)}...`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━',
        `Hi Developer 👋, the app crashed on the *${compName}* component.`,
        'Please check the error and stack trace above and fix it.',
        'Thank you! 🙏',
    ].filter(Boolean);

    const msg = lines.join('\n');
    return `https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

const STYLES = `
  @keyframes eb-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-14px) rotate(2deg); }
    66%       { transform: translateY(-7px) rotate(-1.5deg); }
  }
  @keyframes eb-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.7; }
    100% { transform: scale(1.6);  opacity: 0; }
  }
  @keyframes eb-orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(50px,-35px) scale(1.1); }
  }
  @keyframes eb-orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-45px,45px) scale(0.9); }
  }
  @keyframes eb-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes eb-slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes eb-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .eb-card     { animation: eb-slide-up 0.55s cubic-bezier(.22,1,.36,1) both; }
  .eb-card-d1  { animation-delay: 0.1s; }
  .eb-card-d2  { animation-delay: 0.2s; }

  .eb-btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(239,68,68,0.45) !important; }
  .eb-btn-ghost:hover   { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important; }
  .eb-btn-wa:hover      { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(37,211,102,0.5) !important; background: #20c05a !important; }

  .eb-stack-box::-webkit-scrollbar { height: 4px; width: 4px; }
  .eb-stack-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

  @media (max-width: 640px) {
    .eb-500-text { font-size: clamp(80px, 22vw, 130px) !important; }
    .eb-title    { font-size: 18px !important; }
    .eb-btns     { flex-direction: column !important; }
    .eb-btns > * { width: 100% !important; }
  }
`;

const WhatsAppIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
        width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.826.737 5.484 2.027 7.8L0 32l8.395-2.002A15.933 15.933 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.091a13.043 13.043 0 0 1-6.648-1.817l-.477-.284-4.945 1.18 1.233-4.784-.312-.49A13.04 13.04 0 0 1 2.91 16C2.91 9.317 8.317 3.91 16 3.91S29.091 9.317 29.091 16 23.683 29.091 16 29.091zm7.153-9.773c-.393-.196-2.324-1.147-2.685-1.278-.361-.13-.624-.196-.886.196-.262.392-1.016 1.278-1.245 1.54-.229.261-.458.294-.85.098-.393-.196-1.659-.612-3.16-1.95-1.168-1.043-1.957-2.33-2.186-2.722-.229-.392-.024-.604.172-.799.177-.175.393-.458.589-.687.196-.229.261-.392.393-.654.13-.261.065-.49-.033-.687-.098-.196-.886-2.136-1.213-2.923-.32-.768-.644-.664-.886-.676-.229-.012-.49-.014-.752-.014a1.44 1.44 0 0 0-1.046.49c-.36.392-1.377 1.344-1.377 3.278s1.41 3.8 1.607 4.063c.196.261 2.775 4.237 6.723 5.94.94.406 1.674.648 2.247.83.943.3 1.803.257 2.483.156.757-.113 2.324-.95 2.652-1.868.327-.917.327-1.702.229-1.868-.098-.163-.36-.261-.752-.457z"/>
    </svg>
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError     : false,
            error        : null,
            errorInfo    : null,
            showDetails  : false,
        };
        this.handleToggleDetails = this.handleToggleDetails.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleToggleDetails() {
        this.setState(s => ({ showDetails: !s.showDetails }));
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        const { error, errorInfo, showDetails } = this.state;
        const compName   = extractComponentName(errorInfo?.componentStack);
        const whatsAppUrl = buildWhatsAppUrl(error, errorInfo);
        const errorId    = Date.now().toString(36).toUpperCase();
        const time       = new Date().toLocaleTimeString('en-BD', { timeZone: 'Asia/Dhaka' });

        const displayStack = (error?.stack || '')
            .split('\n')
            .slice(0, 10)
            .join('\n');

        return (
            <>
                <style>{STYLES}</style>

                {/* ── Full-page wrapper ── */}
                <div style={{
                    minHeight           : '100vh',
                    position            : 'relative',
                    overflow            : 'hidden',
                    display             : 'flex',
                    alignItems          : 'center',
                    justifyContent      : 'center',
                    padding             : '24px 16px',
                    background          : 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 40%, #1c1c2e 100%)',
                }}>

                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                        <div style={{
                            position    : 'absolute', top: '-15%', left: '-10%',
                            width       : 'clamp(280px,50vw,580px)', height: 'clamp(280px,50vw,580px)',
                            borderRadius: '50%',
                            background  : 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)',
                            animation   : 'eb-orb1 12s ease-in-out infinite',
                        }} />
                        <div style={{
                            position    : 'absolute', bottom: '-20%', right: '-10%',
                            width       : 'clamp(240px,45vw,520px)', height: 'clamp(240px,45vw,520px)',
                            borderRadius: '50%',
                            background  : 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
                            animation   : 'eb-orb2 15s ease-in-out infinite',
                        }} />
                        <div style={{
                            position        : 'absolute', inset: 0,
                            backgroundImage : 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                            backgroundSize  : '40px 40px',
                        }} />
                    </div>

                    <div style={{
                        position    : 'relative',
                        zIndex      : 1,
                        width       : '100%',
                        maxWidth    : 660,
                        animation   : 'eb-fade-in 0.4s ease both',
                    }}>
                        <div className="eb-card" style={{
                            background          : 'rgba(255,255,255,0.04)',
                            backdropFilter      : 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border              : '1px solid rgba(255,255,255,0.08)',
                            borderRadius        : 24,
                            padding             : 'clamp(28px, 5vw, 48px)',
                            boxShadow           : '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
                            textAlign           : 'center',
                        }}>

                            <div style={{
                                position    : 'relative',
                                display     : 'inline-block',
                                marginBottom: 8,
                                animation   : 'eb-float 5s ease-in-out infinite',
                            }}>
                                <div style={{
                                    position    : 'absolute', inset: '-20px', borderRadius: '50%',
                                    border      : '2px solid rgba(239,68,68,0.4)',
                                    animation   : 'eb-pulse-ring 2.5s ease-out infinite',
                                }} />
                                <div style={{
                                    position    : 'absolute', inset: '-20px', borderRadius: '50%',
                                    border      : '2px solid rgba(239,68,68,0.25)',
                                    animation   : 'eb-pulse-ring 2.5s ease-out infinite 0.9s',
                                }} />
                                <div style={{
                                    width           : 88, height: 88, borderRadius: '50%',
                                    background      : 'linear-gradient(135deg, #dc2626, #7c3aed)',
                                    display         : 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow       : '0 16px 40px rgba(220,38,38,0.5)',
                                    margin          : '0 auto',
                                }}>
                                    <BugOutlined style={{ fontSize: 40, color: '#fff' }} />
                                </div>
                            </div>

                            <div className="eb-500-text" style={{
                                fontSize            : 'clamp(100px, 18vw, 150px)',
                                fontWeight          : 900,
                                lineHeight          : 1,
                                marginTop           : 16,
                                background          : 'linear-gradient(135deg, #ef4444 0%, #a855f7 50%, #f97316 100%)',
                                backgroundSize      : '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor : 'transparent',
                                backgroundClip      : 'text',
                                animation           : 'eb-shimmer 4s linear infinite',
                                fontFamily          : '"Segoe UI", system-ui, sans-serif',
                                letterSpacing       : '-4px',
                                userSelect          : 'none',
                            }}>
                                500
                            </div>

                            <h1 className="eb-title" style={{
                                color       : '#fff',
                                fontSize    : 'clamp(18px, 3vw, 24px)',
                                fontWeight  : 700,
                                margin      : '4px 0 10px',
                                letterSpacing: '-0.3px',
                            }}>
                                Something Went Wrong
                            </h1>

                            <p style={{
                                color       : 'rgba(255,255,255,0.5)',
                                fontSize    : 'clamp(13px, 2vw, 15px)',
                                margin      : '0 0 22px',
                                lineHeight  : 1.6,
                            }}>
                                The app encountered an unexpected runtime error. Don&apos;t worry — your
                                data is safe. You can refresh or go back home.
                            </p>

                            <div style={{
                                display         : 'inline-flex',
                                alignItems      : 'center',
                                gap             : 8,
                                background      : 'rgba(239,68,68,0.12)',
                                border          : '1px solid rgba(239,68,68,0.3)',
                                borderRadius    : 100,
                                padding         : '6px 16px',
                                marginBottom    : 20,
                                maxWidth        : '100%',
                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: '#ef4444', flexShrink: 0,
                                    boxShadow: '0 0 6px #ef4444',
                                }} />
                                <code style={{
                                    color       : '#fca5a5',
                                    fontSize    : 12,
                                    fontFamily  : '"Fira Code", "Cascadia Code", monospace',
                                    whiteSpace  : 'nowrap',
                                    overflow    : 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth    : '100%',
                                }}>
                                    {error?.name}: {error?.message?.substring(0, 80)}{error?.message?.length > 80 ? '…' : ''}
                                </code>
                            </div>

                            <div className="eb-card eb-card-d1" style={{
                                background  : 'rgba(239,68,68,0.08)',
                                border      : '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 14,
                                padding     : '14px 18px',
                                marginBottom: 16,
                                textAlign   : 'left',
                                display     : 'flex',
                                gap         : 10,
                                alignItems  : 'flex-start',
                            }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ color: '#fca5a5', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
                                        Failed in Component
                                    </p>
                                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                                        Component:{' '}
                                        <code style={{
                                            background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                                            padding: '1px 6px', borderRadius: 4, fontSize: 12,
                                        }}>
                                            {'<'}{compName}{' />'}
                                        </code>
                                        <br />
                                        Page:{' '}
                                        <span style={{ color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>
                                            {window.location.pathname}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="eb-card eb-card-d2" style={{
                                background  : 'rgba(0,0,0,0.25)',
                                border      : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 14,
                                marginBottom: 24,
                                overflow    : 'hidden',
                                textAlign   : 'left',
                            }}>
                                <button
                                    onClick={this.handleToggleDetails}
                                    style={{
                                        width       : '100%',
                                        background  : 'none',
                                        border      : 'none',
                                        color       : 'rgba(255,255,255,0.5)',
                                        fontSize    : 12,
                                        fontWeight  : 600,
                                        padding     : '10px 16px',
                                        cursor      : 'pointer',
                                        textAlign   : 'left',
                                        display     : 'flex',
                                        alignItems  : 'center',
                                        gap         : 6,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    <span style={{
                                        display: 'inline-block',
                                        transition: 'transform 0.2s',
                                        transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)',
                                    }}>▶</span>
                                    {showDetails ? 'Hide' : 'Show'} Stack Trace
                                </button>

                                {showDetails && (
                                    <div className="eb-stack-box" style={{
                                        borderTop   : '1px solid rgba(255,255,255,0.06)',
                                        padding     : '12px 16px',
                                        maxHeight   : 200,
                                        overflowY   : 'auto',
                                        overflowX   : 'auto',
                                    }}>
                                        <pre style={{
                                            color       : 'rgba(255,255,255,0.45)',
                                            fontSize    : 11,
                                            fontFamily  : '"Fira Code", "Cascadia Code", monospace',
                                            margin      : 0,
                                            whiteSpace  : 'pre',
                                            lineHeight  : 1.7,
                                        }}>
                                            {displayStack}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                height      : 1,
                                background  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                marginBottom: 22,
                            }} />

                            <div className="eb-btns" style={{
                                display         : 'flex',
                                gap             : 10,
                                justifyContent  : 'center',
                                flexWrap        : 'wrap',
                            }}>

                                <button
                                    className="eb-btn-primary"
                                    onClick={() => window.location.reload()}
                                    style={{
                                        display         : 'flex', alignItems: 'center', gap: 8,
                                        background      : 'linear-gradient(135deg,#dc2626,#7c3aed)',
                                        border          : 'none', borderRadius: 12,
                                        color           : '#fff', fontSize: 14, fontWeight: 600,
                                        padding         : '12px 22px', cursor: 'pointer',
                                        transition      : 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow       : '0 4px 16px rgba(220,38,38,0.35)',
                                        flex            : '1 1 auto', justifyContent: 'center', minWidth: 140,
                                    }}
                                >
                                    <ReloadOutlined />
                                    Reload Page
                                </button>

                                <button
                                    className="eb-btn-ghost"
                                    onClick={() => { window.location.href = '/'; }}
                                    style={{
                                        display         : 'flex', alignItems: 'center', gap: 8,
                                        background      : 'rgba(255,255,255,0.07)',
                                        border          : '1px solid rgba(255,255,255,0.14)',
                                        borderRadius    : 12,
                                        color           : 'rgba(255,255,255,0.85)',
                                        fontSize        : 14, fontWeight: 600,
                                        padding         : '12px 22px', cursor: 'pointer',
                                        transition      : 'transform 0.2s, box-shadow 0.2s',
                                        backdropFilter  : 'blur(8px)',
                                        flex            : '1 1 auto', justifyContent: 'center', minWidth: 130,
                                    }}
                                >
                                    <HomeOutlined />
                                    Back Home
                                </button>

                                <Tooltip title="Opens WhatsApp with full error details pre-filled" color="#1d0a0a">
                                    <a
                                        className="eb-btn-wa"
                                        href={whatsAppUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display         : 'flex', alignItems: 'center', gap: 8,
                                            background      : '#25D366',
                                            border          : 'none', borderRadius: 12,
                                            color           : '#fff', fontSize: 14, fontWeight: 600,
                                            padding         : '12px 22px', cursor: 'pointer',
                                            textDecoration  : 'none',
                                            transition      : 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                                            boxShadow       : '0 4px 16px rgba(37,211,102,0.3)',
                                            flex            : '1 1 auto', justifyContent: 'center', minWidth: 180,
                                        }}
                                    >
                                        <WhatsAppIcon size={18} />
                                        Contact Developer
                                    </a>
                                </Tooltip>
                            </div>

                            <p style={{
                                color       : 'rgba(255,255,255,0.2)',
                                fontSize    : 11,
                                marginTop   : 22,
                                marginBottom: 0,
                                lineHeight  : 1.5,
                            }}>
                                Error ID:{' '}
                                <code style={{ color: 'rgba(255,255,255,0.3)' }}>{errorId}</code>
                                &nbsp;·&nbsp; {time}
                            </p>

                        </div>

                        <div style={{
                            height      : 2,
                            background  : 'linear-gradient(90deg, transparent, rgba(220,38,38,0.8), rgba(168,85,247,0.8), transparent)',
                            borderRadius: '0 0 24px 24px',
                            marginTop   : -2,
                        }} />
                    </div>
                </div>
            </>
        );
    }
}

export default ErrorBoundary;
