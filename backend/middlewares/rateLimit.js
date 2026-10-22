/**
 * Simple in-memory rate limiter.
 * Good enough for a single server instance; use Redis-backed limiting if you scale out.
 */
const rateLimit = ({ windowMs, max, message, keyFn }) => {
    const hits = new Map();

    // Drop expired entries so memory doesn't grow forever
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) {
            if (entry.resetAt <= now) hits.delete(key);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const key = keyFn ? keyFn(req) : req.ip;
        const now = Date.now();
        let entry = hits.get(key);

        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }

        entry.count++;

        if (entry.count > max) {
            res.set('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            return res.status(429).json({
                success: false,
                message: message || 'Too many requests, please try again later'
            });
        }

        next();
    };
};

export default rateLimit;
