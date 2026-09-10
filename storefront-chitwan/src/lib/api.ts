const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://backend-api-production-be2e.up.railway.app/api/v1' : 'http://localhost:3001/api/v1');

async function fetchJSON(path: string) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
        let msg = `API error ${res.status}`;
        try { const errData = await res.json(); msg = errData.message || errData.error || msg; } catch (e) {}
        throw new Error(msg);
    }
    return res.json();
}

async function postJSON(path: string, data: any) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let msg = `API error ${res.status}`;
        try { const errData = await res.json(); msg = errData.message || errData.error || msg; } catch (e) {}
        throw new Error(msg);
    }
    return res.json();
}

export const api = {
    // Generic methods for React Query / raw Axios-like calls
    get: async (path: string, options?: any) => {
        let q = '';
        if (options?.params) {
            q = '?' + new URLSearchParams(options.params).toString();
        }
        const data = await fetchJSON(`${path}${q}`);
        return { data };
    },
    post: async (path: string, payload?: any) => { const data = await postJSON(path, payload || {}); return { data }; },

    // Existing endpoints
    getBusServices: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ status: 'active', limit: '50', ...params }).toString();
        return fetchJSON(`/bus-services?${q}`);
    },
    getBusServiceBySlug: (slug: string) => fetchJSON(`/bus-services/by-slug/${slug}`),
    getTourPackages: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ status: 'active', limit: '50', ...params }).toString();
        return fetchJSON(`/tour-packages?${q}`);
    },
    getTourPackageBySlug: (slug: string) => fetchJSON(`/tour-packages/slug/${slug}`),
    getVehicleRentals: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ availabilityStatus: 'available', limit: '50', ...params }).toString();
        return fetchJSON(`/vehicle-rentals?${q}`);
    },
    getFeaturedVehicleRentals: () => fetchJSON('/vehicle-rentals/featured'),
    getVehicleRentalBySlug: (slug: string) => fetchJSON(`/vehicle-rentals/by-slug/${slug}`),
    getTestimonials: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ approved: 'true', limit: '20', ...params }).toString();
        return fetchJSON(`/testimonials?${q}`);
    },
    getLocations: () => fetchJSON('/locations'),
    getHeroBanners: () => fetchJSON('/hero-banners?active=true'),
    getAbout: () => fetchJSON('/about'),
    getContact: () => fetchJSON('/contact'),

    // CMS endpoints
    getBlogs: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ status: 'active', limit: '50', ...params }).toString();
        return fetchJSON(`/blogs?${q}`);
    },
    getFeaturedBlogs: () => fetchJSON('/blogs/featured'),
    getBlogBySlug: (slug: string) => fetchJSON(`/blogs/${slug}`),
    getFaqs: () => fetchJSON('/faqs?status=active'),
    getTeam: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ status: 'active', ...params }).toString();
        return fetchJSON(`/team?${q}`);
    },
    getAchievements: () => fetchJSON('/achievements?status=active'),
    getGallery: (params: Record<string, string> = {}) => {
        const q = new URLSearchParams({ status: 'active', ...params }).toString();
        return fetchJSON(`/gallery?${q}`);
    },
    getSiteSettings: () => fetchJSON('/site-settings'),
    getSliders: () => fetchJSON('/sliders?status=active'),
    getFeatures: () => fetchJSON('/features?status=active'),
    getAdventureActivities: () => fetchJSON('/adventure-activities?status=active'),
    getAdventureActivityBySlug: (slug: string) => fetchJSON(`/adventure-activities/by-slug/${slug}`),

    // Public submission endpoints
    submitBookingInquiry: (data: any) => postJSON('/booking-inquiries', data),
    submitPartnerRequest: (data: any) => postJSON('/partner-requests', data),
    submitContactForm: (data: any) => postJSON('/contact-submissions', data),
    subscribe: (email: string) => postJSON('/email-subscribers', { email }),

    // ═══════════════════════════════════════════════════
    // Bus Portal API (via NestJS Backend proxy)
    // ═══════════════════════════════════════════════════
    busPortal: {
        _base: '/bus-portal',

        /** Get available route locations */
        getRoutes() {
            return fetchJSON(`${this._base}/routes`);
        },

        /** Search trips between two locations on a date */
        searchTrips(from_location: string, to_location: string, date: string) {
            return postJSON(`${this._base}/trips`, { from_location, to_location, date });
        },

        /** Hold selected seats — returns ticket/holding number */
        holdSeats(seat: string, totalseat: string, busno: string) {
            return postJSON(`${this._base}/hold-seat`, { seat, totalseat, busno });
        },

        /** Cancel a held seat by holding number */
        cancelHold(holdingnumber: string) {
            return postJSON(`${this._base}/cancel-hold`, { holdingnumber });
        },

        /** Fill passenger details for a booking */
        fillPassenger(data: any) {
            return postJSON(`${this._base}/passenger-detail`, data);
        },

        /** Get passenger details by ticket number */
        getPassenger(ticketNo: string) {
            return postJSON(`${this._base}/passenger-detail/query`, { TicketNo: ticketNo });
        },

        /** Confirm payment */
        confirmPayment(data: any) {
            return postJSON(`${this._base}/payment-confirm`, data);
        },

        /** Query ticket confirmation status */
        getTicketStatus(ticketNo: string) {
            return postJSON(`${this._base}/ticket-status`, { TicketNo: ticketNo });
        },
    },

    // ═══════════════════════════════════════════════════
    // Destinations (Tours page gallery)
    // ═══════════════════════════════════════════════════
    destinations: {
        list() { return fetchJSON('/destinations'); },
        getBySlug(slug: string) { return fetchJSON(`/destinations/${slug}`); },
    },

    // ═══════════════════════════════════════════════════
    // Stories (Instagram-style circles)
    // ═══════════════════════════════════════════════════
    stories: {
        list() { return fetchJSON('/stories'); },
    },

    // ═══════════════════════════════════════════════════
    // Payments (eSewa, Khalti, Cash on Bus)
    // ═══════════════════════════════════════════════════
    payments: {
        initiate(data: any) { return postJSON('/payments/initiate', data); },
        getByTicketNo(ticketNo: string) { return fetchJSON(`/payments/ticket/${ticketNo}`); },
        getByPhone(phone: string) { return fetchJSON(`/payments/phone/${phone}`); },
    },

    // ═══════════════════════════════════════════════════
    // AI Chatbot
    // ═══════════════════════════════════════════════════
    chatbot: {
        sendMessage(message: string, sessionId: string) {
            return postJSON('/chatbot/message', { message, sessionId });
        },
    },
};

export default api;
