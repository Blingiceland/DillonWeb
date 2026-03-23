import React, { useState, useEffect, useRef } from 'react';
import { fetchEvents } from '../utils/googleSheet';

const MONTH_NAMES_IS = [
    'Janúar', 'Febrúar', 'Mars', 'Apríl', 'Maí', 'Júní',
    'Júlí', 'Ágúst', 'September', 'Október', 'Nóvember', 'Desember'
];

const WhatsOn = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const todayRef = useRef(null);

    useEffect(() => {
        const loadEvents = async () => {
            const data = await fetchEvents();
            setAllEvents(data);
            setLoading(false);
        };
        loadEvents();
    }, []);

    // Callback ref for auto-scroll — fires when the anchor card mounts
    const anchorCallback = (node) => {
        if (node && scrollRef.current) {
            todayRef.current = node;
            requestAnimationFrame(() => {
                const container = scrollRef.current;
                if (!container) return;
                // Get position relative to scroll container
                const containerRect = container.getBoundingClientRect();
                const cardRect = node.getBoundingClientRect();
                const currentScroll = container.scrollLeft;
                const targetScroll = currentScroll + (cardRect.left - containerRect.left) - containerRect.width / 2 + cardRect.width / 2;
                container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' });
            });
        }
    };

    // Group events by month
    const groupedByMonth = allEvents.reduce((groups, evt) => {
        const key = `${evt.dateObj.getFullYear()}-${evt.dateObj.getMonth()}`;
        if (!groups[key]) {
            groups[key] = {
                label: `${MONTH_NAMES_IS[evt.dateObj.getMonth()]} ${evt.dateObj.getFullYear()}`,
                events: []
            };
        }
        groups[key].events.push(evt);
        return groups;
    }, {});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstUpcomingIndex = allEvents.findIndex(e => e.dateObj >= today);

    return (
        <div className="whatson-wrap" id="whatson">
            <div className="whatson-header-bar">
                <h2>Dagskrá</h2>
                <p>Flettu til hliðar til að sjá alla viðburði</p>
            </div>

            <div className="whatson-hscroll gold-scrollbar" ref={scrollRef}>
                {loading ? (
                    <div className="whatson-loading">Sæki dagskrá...</div>
                ) : allEvents.length === 0 ? (
                    <div className="whatson-empty">Engir viðburðir skráðir.</div>
                ) : (
                    Object.values(groupedByMonth).map((group, gi) => (
                        <div className="whatson-month-col" key={gi}>
                            <div className="whatson-month-label">{group.label}</div>
                            <div className="whatson-cards-row">
                                {group.events.map((evt) => {
                                    const evtDate = new Date(evt.dateObj);
                                    evtDate.setHours(0, 0, 0, 0);
                                    const isPast = evtDate < today;
                                    const isToday = evtDate.getTime() === today.getTime();
                                    const globalIdx = allEvents.indexOf(evt);
                                    const isAnchor = globalIdx === firstUpcomingIndex;

                                    const dayName = new Intl.DateTimeFormat('is-IS', { weekday: 'short' })
                                        .format(evt.dateObj).toUpperCase();

                                    const classList = [
                                        'whatson-card',
                                        isPast ? 'past' : '',
                                        isToday ? 'today' : ''
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <div
                                            key={evt.id}
                                            className={classList}
                                            ref={isAnchor ? anchorCallback : null}
                                        >
                                            <div className="whatson-card-date">
                                                <span className="whatson-card-daynum">{evt.dayNum}</span>
                                                <span className="whatson-card-dayname">{dayName}</span>
                                            </div>
                                            <div className="whatson-card-title">{evt.title}</div>
                                            <div className="whatson-card-time">{evt.time}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WhatsOn;
