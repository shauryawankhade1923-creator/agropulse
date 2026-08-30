const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1` 
  : '/api/v1';

export const api = {
  // AI Endpoints
  getPriceRecommendation: async (params) => {
    const res = await fetch(`${API_BASE}/ai/price-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to fetch AI price recommendation');
    return res.json();
  },

  predictQueueWaitTime: async (params) => {
    const res = await fetch(`${API_BASE}/ai/queue-wait-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to estimate wait time');
    return res.json();
  },

  // Produce
  getProduces: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/produce/${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to load produces');
    return res.json();
  },

  createProduce: async (data) => {
    const res = await fetch(`${API_BASE}/produce/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to list produce');
    }
    return res.json();
  },

  // Matching & Offers
  getMatchedBuyers: async (produceId) => {
    const res = await fetch(`${API_BASE}/matching/for-produce/${produceId}`);
    if (!res.ok) throw new Error('Failed to fetch matched buyers');
    return res.json();
  },

  placeBuyerOffer: async (data) => {
    const res = await fetch(`${API_BASE}/matching/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to submit offer');
    }
    return res.json();
  },

  getOffersForProduce: async (produceId) => {
    const res = await fetch(`${API_BASE}/matching/offers/produce/${produceId}`);
    if (!res.ok) throw new Error('Failed to fetch offers');
    return res.json();
  },

  getOffersForFarmer: async (farmerId = 1) => {
    const res = await fetch(`${API_BASE}/matching/offers/farmer/${farmerId}`);
    if (!res.ok) throw new Error('Failed to fetch farmer offers');
    return res.json();
  },

  getOffersByBuyer: async (buyerId = 4) => {
    const res = await fetch(`${API_BASE}/matching/offers/buyer/${buyerId}`);
    if (!res.ok) throw new Error('Failed to fetch buyer offers');
    return res.json();
  },

  acceptBuyerOffer: async (offerId) => {
    const res = await fetch(`${API_BASE}/matching/offer/${offerId}/accept`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to accept offer');
    return res.json();
  },

  cancelBuyerOffer: async (offerId, cancelledBy = 'FARMER', reason = null) => {
    const params = new URLSearchParams({ cancelled_by: cancelledBy });
    if (reason) params.append('reason', reason);
    const res = await fetch(`${API_BASE}/matching/offer/${offerId}/cancel?${params.toString()}`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to cancel offer');
    return res.json();
  },

  // Procurement & Tokens
  getProcurementCenters: async () => {
    const res = await fetch(`${API_BASE}/procurement/centers`);
    if (!res.ok) throw new Error('Failed to load procurement centers');
    return res.json();
  },

  getCenterSlots: async (centerId) => {
    const res = await fetch(`${API_BASE}/procurement/center/${centerId}/slots`);
    if (!res.ok) throw new Error('Failed to load center slots');
    return res.json();
  },

  bookToken: async (data) => {
    const res = await fetch(`${API_BASE}/procurement/book-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to book slot & token');
    return res.json();
  },

  getFarmerTokens: async (farmerId) => {
    const res = await fetch(`${API_BASE}/procurement/tokens/farmer/${farmerId}`);
    if (!res.ok) throw new Error('Failed to fetch farmer tokens');
    return res.json();
  },

  getTokenByNumber: async (tokenNumber) => {
    const res = await fetch(`${API_BASE}/procurement/token/${tokenNumber}`);
    if (!res.ok) throw new Error('Token not found');
    return res.json();
  },

  getTokenById: async (tokenId) => {
    const res = await fetch(`${API_BASE}/procurement/token-by-id/${tokenId}`);
    if (!res.ok) throw new Error('Token not found');
    return res.json();
  },

  cancelToken: async (tokenId) => {
    const res = await fetch(`${API_BASE}/procurement/token/${tokenId}/cancel`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to cancel token');
    return res.json();
  },

  // Queue
  getLiveQueueBoard: async (centerId = 1) => {
    const res = await fetch(`${API_BASE}/queue/center/${centerId}/live-board`);
    if (!res.ok) throw new Error('Failed to fetch live queue board');
    return res.json();
  },

  advanceTokenStage: async (data) => {
    const res = await fetch(`${API_BASE}/queue/advance-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to advance token stage');
    }
    return res.json();
  },

  // Smart Freight & Logistics Pooling
  getLogisticsPools: async (destinationCenterId = null) => {
    const url = destinationCenterId 
      ? `${API_BASE}/logistics/pools?destination_center_id=${destinationCenterId}`
      : `${API_BASE}/logistics/pools`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch logistics pools');
    return res.json();
  },

  getRegisteredVehicles: async () => {
    const res = await fetch(`${API_BASE}/logistics/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch registered vehicles');
    return res.json();
  },

  joinFreightPool: async (data) => {
    const res = await fetch(`${API_BASE}/logistics/join-pool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to join freight pool');
    }
    return res.json();
  },

  getFarmerFreightBookings: async (farmerId = 1) => {
    const res = await fetch(`${API_BASE}/logistics/farmer/${farmerId}/bookings`);
    if (!res.ok) throw new Error('Failed to fetch freight bookings');
    return res.json();
  },

  estimateFreightFare: async (data) => {
    const res = await fetch(`${API_BASE}/logistics/estimate-fare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to estimate freight fare');
    return res.json();
  },

  // WhatsApp, SMS, & App Notifications
  getNotificationLogs: async (channel = null, limit = 50) => {
    const url = channel ? `${API_BASE}/notifications/logs?channel=${channel}&limit=${limit}` : `${API_BASE}/notifications/logs?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notification logs');
    return res.json();
  },

  getUserNotifications: async (phone, channel = null) => {
    const url = channel ? `${API_BASE}/notifications/user/${phone}?channel=${channel}` : `${API_BASE}/notifications/user/${phone}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch user notifications');
    return res.json();
  },

  getUnreadNotificationCount: async (phone = null) => {
    const url = phone ? `${API_BASE}/notifications/unread-count?phone=${phone}` : `${API_BASE}/notifications/unread-count`;
    const res = await fetch(url);
    if (!res.ok) return { unread_count: 0 };
    return res.json();
  },

  sendSMSAlert: async (data) => {
    const res = await fetch(`${API_BASE}/notifications/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to dispatch SMS alert');
    }
    return res.json();
  },

  sendAppNotification: async (data) => {
    const res = await fetch(`${API_BASE}/notifications/send-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to dispatch App notification');
    }
    return res.json();
  },

  sendCustomNotification: async (data) => {
    const res = await fetch(`${API_BASE}/notifications/send-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send notification');
    return res.json();
  },

  markNotificationsRead: async (payload = { mark_all: true }) => {
    const res = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { status: 'error' };
    return res.json();
  },

  // Payments
  getFarmerPayments: async (farmerId) => {
    const res = await fetch(`${API_BASE}/payments/farmer/${farmerId}`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  getAllPayments: async () => {
    const res = await fetch(`${API_BASE}/payments/all`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  // Analytics
  getAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  // Trade Reviews & Reputation
  submitTradeReview: async (data) => {
    const res = await fetch(`${API_BASE}/reviews/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit review');
    }
    return res.json();
  },

  getUserReviews: async (userId) => {
    const res = await fetch(`${API_BASE}/reviews/user/${userId}`);
    if (!res.ok) throw new Error('Failed to load user reviews');
    return res.json();
  },

  getUserReputationSummary: async (userId) => {
    const res = await fetch(`${API_BASE}/reviews/summary/${userId}`);
    if (!res.ok) throw new Error('Failed to load reputation summary');
    return res.json();
  },

  // Computer Vision Quality Grading
  gradeProduceImage: async (payload) => {
    // Check if payload is FormData (file upload) or JSON object (sample/base64)
    if (payload instanceof FormData) {
      const res = await fetch(`${API_BASE}/ai/upload-and-grade`, {
        method: 'POST',
        body: payload
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to grade uploaded produce image');
      }
      return res.json();
    } else {
      const res = await fetch(`${API_BASE}/ai/grade-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to grade produce image');
      }
      return res.json();
    }
  },

  getSampleSpecimens: async () => {
    const res = await fetch(`${API_BASE}/ai/sample-specimens`);
    if (!res.ok) throw new Error('Failed to load sample produce specimens');
    return res.json();
  },

  // AI Real-Time Queue Detection & CCTV Vision
  detectQueueVision: async (payload) => {
    const res = await fetch(`${API_BASE}/ai/detect-queue-vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to analyze queue CCTV feed');
    }
    return res.json();
  },

  getCCTVQueueSamples: async () => {
    const res = await fetch(`${API_BASE}/ai/cctv-queue-samples`);
    if (!res.ok) throw new Error('Failed to load APMC CCTV sample feeds');
    return res.json();
  }
};


