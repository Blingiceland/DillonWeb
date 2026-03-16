
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1LzwjwuFwCaNowXFavQuGjPYPqQV7iweFftqABDu9DNs/gviz/tq?tqx=out:csv&sheet=2026';

// Month name mapping for parsing dates like "Thursday 19 March"
const MONTH_MAP = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
};

/**
 * Parsed Event definition
 * @typedef {Object} DEvent
 * @property {string} id
 * @property {string} title - Band / event name
 * @property {Date} dateObj
 * @property {string} dateDisplay
 * @property {string} time
 * @property {string} dayOfWeek - e.g. "Thursday"
 * @property {number} dayNum - day of month
 * @property {string} monthYear - e.g. "March 2026"
 */

export const fetchEvents = async () => {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
};

const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    // Skip header row
    const events = [];
    const currentYear = 2026; // The sheet is for 2026

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseLine(line);
        
        // Column A = date (e.g. "Thursday 19 March")
        // Column B = start time (e.g. "21:00")  
        // Column C = band name
        const dateRaw = (cols[0] || '').replace(/^"|"$/g, '').trim();
        const time = (cols[1] || '').replace(/^"|"$/g, '').trim();
        const band = (cols[2] || '').replace(/^"|"$/g, '').trim();

        // Skip rows with no band name
        if (!band) continue;

        // Skip cancelled events
        if (band.toLowerCase().includes('cancelled') || band.toLowerCase().includes('canceled')) continue;

        // Parse date like "Thursday 19 March"
        const dateParts = dateRaw.split(/\s+/);
        if (dateParts.length < 3) continue;

        const dayOfWeek = dateParts[0];
        const dayNum = parseInt(dateParts[1], 10);
        const monthName = dateParts[2].toLowerCase();
        const month = MONTH_MAP[monthName];

        if (isNaN(dayNum) || month === undefined) continue;

        const dateObj = new Date(currentYear, month, dayNum);

        // Format display
        const dateDisplay = `${dayNum}. ${dateParts[2]}`;

        events.push({
            id: `evt-${i}`,
            title: band.trim(),
            dateObj,
            dateDisplay,
            time: time || '21:00',
            dayOfWeek,
            dayNum,
            monthYear: `${dateParts[2]} ${currentYear}`,
            month,
        });
    }

    // Sort by date
    return events.sort((a, b) => a.dateObj - b.dateObj);
};

// Helper for CSV line parsing with quotes support
const parseLine = (text) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let char of text) {
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
};
