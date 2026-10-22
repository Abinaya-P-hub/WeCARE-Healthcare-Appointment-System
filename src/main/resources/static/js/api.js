/**
 * WeCARE Healthcare Portal - API Client Module
 * Connects directly to the Spring Boot REST Backend on port 8081
 */

const API_BASE = window.location.origin.includes(':8081') ? '' : 'http://localhost:8081';

const API = {
  // Check Backend Health / Connectivity
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/coaches`);
      return response.ok;
    } catch (err) {
      console.warn("Backend not reachable at", API_BASE, err);
      return false;
    }
  },

  // =====================
  // COACH ENDPOINTS
  // =====================

  // GET /api/coaches or /api/coaches?specialty=...
  async getCoaches(specialty = '') {
    const url = specialty 
      ? `${API_BASE}/api/coaches?specialty=${encodeURIComponent(specialty)}`
      : `${API_BASE}/api/coaches`;
    const res = await fetch(url);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // GET /api/coaches/{coachId}
  async getCoachProfile(coachId) {
    const res = await fetch(`${API_BASE}/api/coaches/${coachId}`);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // POST /api/coaches
  async registerCoach(coachData) {
    const res = await fetch(`${API_BASE}/api/coaches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coachData)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // POST /api/coaches/login
  async loginCoach(credentials) {
    const res = await fetch(`${API_BASE}/api/coaches/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // GET /api/coaches/{coachId}/bookings
  async getCoachBookings(coachId) {
    const res = await fetch(`${API_BASE}/api/coaches/${coachId}/bookings`);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // =====================
  // USER ENDPOINTS
  // =====================

  // POST /api/users
  async registerUser(userData) {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // POST /api/users/login
  async loginUser(credentials) {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // GET /api/users/{userId}
  async getUserProfile(userId) {
    const res = await fetch(`${API_BASE}/api/users/${userId}`);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // GET /api/users/{userId}/bookings
  async getUserBookings(userId) {
    const res = await fetch(`${API_BASE}/api/users/${userId}/bookings`);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // =====================
  // BOOKING ENDPOINTS
  // =====================

  // POST /api/bookings
  async bookAppointment(bookingData) {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // PUT /api/bookings/{bookingId}
  async rescheduleAppointment(bookingId, bookingData) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // DELETE /api/bookings/{bookingId}
  async cancelAppointment(bookingId) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // GET /api/bookings/{bookingId}
  async getBookingDetails(bookingId) {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`);
    if (!res.ok) throw await this.handleError(res);
    return await res.json();
  },

  // Helper to extract message from ErrorMessage response
  async handleError(response) {
    try {
      const errorJson = await response.json();
      return new Error(errorJson.message || `Request failed with status ${response.status}`);
    } catch {
      return new Error(`Server returned ${response.status} ${response.statusText}`);
    }
  }
};
