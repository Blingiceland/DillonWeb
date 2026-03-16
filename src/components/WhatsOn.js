import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../utils/googleSheet';

// Get Monday of the week for a given date
const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday = 1, Sunday = 0 -> go back 6
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getSunday = (monday) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

const formatDateRange = (monday) => {
    const sunday = getSunday(monday);
    const opts = { day: 'numeric', month: 'long' };
    const monStr = monday.toLocaleDateString('is-IS', opts);
    const sunStr = sunday.toLocaleDateString('is-IS', opts);
    return `${monStr} – ${sunStr}`;
};

const WhatsOn = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [allEvents, setAllEvents] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekLabel, setWeekLabel] = useState('');

    // Fetch events from Google Sheet on mount
    useEffect(() => {
        const loadEvents = async () => {
            const data = await fetchEvents();
            setAllEvents(data);
            setLoading(false);
        };
        loadEvents();
    }, []);

    // Filter events for current week
    useEffect(() => {
        const today = new Date();
        const monday = getMonday(today);
        monday.setDate(monday.getDate() + weekOffset * 7);
        const sunday = getSunday(monday);

        setWeekLabel(formatDateRange(monday));

        if (allEvents.length === 0 && !loading) {
            setDisplayEvents([]);
            return;
        }

        const filtered = allEvents.filter(e => {
            return e.dateObj >= monday && e.dateObj <= sunday;
        });

        // Build display data with DJ info for weekends
        const weekEvents = filtered.map(event => {
            const dayOfWeekNum = event.dateObj.getDay();
            const isWeekend = dayOfWeekNum === 5 || dayOfWeekNum === 6;
            const dayName = new Intl.DateTimeFormat('is-IS', { weekday: 'short' }).format(event.dateObj);

            return {
                dayName: dayName.toUpperCase(),
                dayNum: event.dayNum,
                concerts: [{
                    time: event.time,
                    title: event.title,
                    isHighlight: true
                }],
                djEvent: isWeekend ? {
                    time: 'Miðnætti',
                    title: 'DJ Andrea Jóns',
                    isHighlight: false,
                    subtext: 'Party until 03:00'
                } : null
            };
        });

        setDisplayEvents(weekEvents);
    }, [weekOffset, allEvents, loading]);

    return (
        <div style={{
            padding: '60px 0',
            background: '#111',
            color: '#fff',
            borderTop: '1px solid #222',
            borderBottom: '1px solid #222'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>

                {/* Header & Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #444',
                            color: 'var(--color-gold)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'var(--color-gold)';
                            e.target.style.background = 'rgba(212, 163, 63, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#444';
                            e.target.style.background = 'transparent';
                        }}
                    >
                        &#9664; Last Week
                    </button>

                    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                        <h2 style={{
                            fontSize: 'clamp(16px, 4vw, 28px)',
                            color: 'var(--color-gold)',
                            margin: '0',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            textShadow: '0 0 10px rgba(212, 163, 63, 0.2)',
                        }}>
                            {weekLabel}
                        </h2>
                        {weekOffset === 0 && (
                            <span style={{
                                fontSize: '12px',
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Þessi vika
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #444',
                            color: 'var(--color-gold)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'var(--color-gold)';
                            e.target.style.background = 'rgba(212, 163, 63, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = '#444';
                            e.target.style.background = 'transparent';
                        }}
                    >
                        Next Week &#9654;
                    </button>
                </div>

                {/* Events Grid */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    paddingBottom: '30px',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    padding: '10px 0 30px 0'
                }}
                    className="gold-scrollbar"
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gold)', width: '100%' }}>
                            Sæki dagskrá...
                        </div>
                    ) : displayEvents.length > 0 ? (
                        displayEvents.map((day, index) => (
                            <div key={index} style={{
                                minWidth: '280px',
                                maxWidth: '280px',
                                minHeight: '320px',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                padding: '25px',
                                display: 'flex',
                                flexDirection: 'column',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                {/* Date Badge */}
                                <div style={{
                                    marginBottom: '20px',
                                    borderBottom: '2px solid var(--color-gold)',
                                    paddingBottom: '10px',
                                    width: '100%'
                                }}>
                                    <span style={{
                                        fontSize: '36px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        lineHeight: '1',
                                        marginRight: '10px'
                                    }}>
                                        {day.dayNum}
                                    </span>
                                    <span style={{
                                        fontSize: '16px',
                                        color: 'var(--color-gold)',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold'
                                    }}>
                                        {day.dayName}
                                    </span>
                                </div>

                                {/* Concerts Section */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    width: '100%',
                                    flexGrow: 1,
                                    marginBottom: '20px'
                                }}>
                                    {day.concerts.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#888',
                                                marginBottom: '4px',
                                                fontFamily: 'monospace'
                                            }}>
                                                {item.time}
                                            </span>
                                            <span style={{
                                                fontSize: '18px',
                                                color: '#fff',
                                                fontWeight: '600',
                                                lineHeight: '1.3'
                                            }}>
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* DJ Section - Always at bottom */}
                                {day.djEvent && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginTop: 'auto',
                                        paddingTop: '15px',
                                        borderTop: '1px dashed #333'
                                    }}>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#888',
                                            marginBottom: '4px',
                                            fontFamily: 'monospace'
                                        }}>
                                            {day.djEvent.time}
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            color: '#ccc',
                                            fontWeight: 'normal',
                                            lineHeight: '1.3'
                                        }}>
                                            {day.djEvent.title}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666', width: '100%' }}>
                            Engir viðburðir skráðir þessa viku.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsOn;
