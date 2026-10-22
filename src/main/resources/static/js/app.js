/**
 * WeCARE Healthcare Portal - Main Frontend Application Logic
 */

const app = {
  // Application State
  state: {
    currentUser: null,
    currentCoach: null,
    coaches: [],
    selectedCoachForModal: null,
    pendingCancelBookingId: null,
    specialties: new Set()
  },

  // Bootstrap Modal Instances
  modals: {},

  // Initialization
  init() {
    this.initModals();
    this.restoreSession();
    this.initDatePickers();
    this.checkBackendHealth();
    this.loadCoaches();
    this.updateAuthNav();

    // Check backend health periodically (every 30 seconds)
    setInterval(() => this.checkBackendHealth(), 30000);
  },

  initModals() {
    const modalIds = [
      'modal-user-login',
      'modal-coach-login',
      'modal-book-appointment',
      'modal-reschedule',
      'modal-cancel-confirm',
      'modal-coach-details'
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.bootstrap) {
        this.modals[id] = new bootstrap.Modal(el);
      }
    });
  },

  initDatePickers() {
    // Restrict date pickers
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Past dates for DOB
    const regUserDob = document.getElementById('reg-user-dob');
    if (regUserDob) regUserDob.max = today;

    const regCoachDob = document.getElementById('reg-coach-dob');
    if (regCoachDob) regCoachDob.max = today;

    // Future dates for Appointment & Reschedule
    const bookDate = document.getElementById('book-date');
    if (bookDate) bookDate.min = tomorrow;

    const rescheduleDate = document.getElementById('reschedule-date');
    if (rescheduleDate) rescheduleDate.min = tomorrow;
  },

  restoreSession() {
    try {
      const savedUser = sessionStorage.getItem('wecare_user');
      if (savedUser) {
        this.state.currentUser = JSON.parse(savedUser);
      }
      const savedCoach = sessionStorage.getItem('wecare_coach');
      if (savedCoach) {
        this.state.currentCoach = JSON.parse(savedCoach);
      }
    } catch (e) {
      console.warn('Could not restore session from storage', e);
    }
  },

  async checkBackendHealth() {
    const badge = document.getElementById('backend-status-badge');
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');

    const isLive = await API.checkHealth();
    if (isLive) {
      dot.className = 'status-dot online';
      text.textContent = 'Backend Online (Port 8081)';
      badge.className = 'badge bg-success d-flex align-items-center px-2 py-1';
    } else {
      dot.className = 'status-dot offline';
      text.textContent = 'Backend Offline';
      badge.className = 'badge bg-danger d-flex align-items-center px-2 py-1';
    }
    return isLive;
  },

  // =====================
  // NAVIGATION & TAB SWITCHING
  // =====================
  showTab(tabName) {
    const views = ['explore', 'patient', 'coach', 'register-user', 'register-coach'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.style.display = (v === tabName) ? 'block' : 'none';
      const navLink = document.getElementById(`nav-link-${v}`);
      if (navLink) navLink.classList.remove('active');
    });

    const activeNav = document.getElementById(`nav-link-${tabName}`);
    if (activeNav) activeNav.classList.add('active');

    // Tab-specific lifecycle hooks
    if (tabName === 'explore') {
      if (this.state.coaches.length === 0) {
        this.loadCoaches();
      }
    } else if (tabName === 'patient') {
      this.renderPatientView();
    } else if (tabName === 'coach') {
      this.renderCoachView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateAuthNav() {
    const container = document.getElementById('auth-buttons-container');
    if (!container) return;

    if (this.state.currentUser) {
      container.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="app.showTab('patient')">
          <i class="bi bi-person-fill me-1"></i> Patient: ${this.escapeHtml(this.state.currentUser.name)}
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="app.logoutUser()" title="Logout patient">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      `;
    } else if (this.state.currentCoach) {
      container.innerHTML = `
        <button class="btn btn-info btn-sm text-white" onclick="app.showTab('coach')">
          <i class="bi bi-award-fill me-1"></i> Coach: ${this.escapeHtml(this.state.currentCoach.name)}
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="app.logoutCoach()" title="Logout coach">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      `;
    } else {
      container.innerHTML = `
        <button class="btn btn-outline-light btn-sm" onclick="app.openUserLoginModal()">
          <i class="bi bi-box-arrow-in-right me-1"></i> Patient Login
        </button>
        <button class="btn btn-outline-info btn-sm" onclick="app.openCoachLoginModal()">
          <i class="bi bi-shield-lock me-1"></i> Coach Login
        </button>
      `;
    }
  },

  // =====================
  // COACH DIRECTORY
  // =====================
  async loadCoaches(specialty = '') {
    const loading = document.getElementById('coaches-loading');
    const grid = document.getElementById('coaches-grid');
    const empty = document.getElementById('coaches-empty');

    loading.style.display = 'block';
    grid.style.display = 'none';
    empty.style.display = 'none';

    try {
      const coaches = await API.getCoaches(specialty);
      this.state.coaches = coaches;

      // Extract unique specialties for dropdown
      if (!specialty) {
        this.populateSpecialtyFilter(coaches);
      }
      this.populateCoachDropdown(coaches);

      loading.style.display = 'none';
      if (coaches.length === 0) {
        empty.style.display = 'block';
      } else {
        grid.style.display = 'flex';
        this.renderCoaches(coaches);
      }
    } catch (err) {
      loading.style.display = 'none';
      this.showAlert(`Failed to load coaches: ${err.message}`, 'danger');
    }
  },

  populateSpecialtyFilter(coaches) {
    const select = document.getElementById('specialty-filter');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">All Specialties</option>';

    const specialties = [...new Set(coaches.map(c => c.specialty).filter(Boolean))].sort();
    specialties.forEach(sp => {
      const opt = document.createElement('option');
      opt.value = sp;
      opt.textContent = sp;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
  },

  populateCoachDropdown(coaches) {
    const select = document.getElementById('book-coach-id');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">Select a Coach</option>';

    coaches.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.coachId;
      opt.textContent = `${c.name} (${c.specialty}) - ID #${c.coachId}`;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
  },

  onSpecialtyChange() {
    const select = document.getElementById('specialty-filter');
    const specialty = select ? select.value : '';
    this.loadCoaches(specialty);
  },

  filterCoaches() {
    const input = document.getElementById('coach-search-input');
    const term = (input ? input.value : '').toLowerCase().trim();

    const filtered = this.state.coaches.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.specialty && c.specialty.toLowerCase().includes(term))
    );

    const grid = document.getElementById('coaches-grid');
    const empty = document.getElementById('coaches-empty');

    if (filtered.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.style.display = 'flex';
      this.renderCoaches(filtered);
    }
  },

  renderCoaches(list) {
    const grid = document.getElementById('coaches-grid');
    if (!grid) return;

    grid.innerHTML = list.map(coach => {
      const initial = (coach.name || 'D').replace('Dr. ', '').charAt(0).toUpperCase();
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card coach-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="coach-avatar me-3">
                  ${initial}
                </div>
                <div>
                  <h5 class="card-title fw-bold mb-1">${this.escapeHtml(coach.name)}</h5>
                  <span class="specialty-badge">${this.escapeHtml(coach.specialty || 'General')}</span>
                </div>
              </div>
              <ul class="list-unstyled small text-muted mb-4 flex-grow-1">
                <li class="mb-1"><i class="bi bi-person-badge text-primary me-2"></i>Coach ID: <strong>#${coach.coachId}</strong></li>
                <li class="mb-1"><i class="bi bi-gender-ambiguous text-primary me-2"></i>Gender: ${coach.gender === 'F' ? 'Female' : 'Male'}</li>
                <li class="mb-1"><i class="bi bi-telephone-fill text-primary me-2"></i>Contact: ${this.escapeHtml(coach.mobileNumber)}</li>
              </ul>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm flex-grow-1" onclick="app.openCoachDetailsModal(${coach.coachId})">
                  <i class="bi bi-info-circle me-1"></i> Details
                </button>
                <button class="btn btn-primary btn-sm flex-grow-1" onclick="app.openBookModalWithCoach(${coach.coachId})">
                  <i class="bi bi-calendar-check me-1"></i> Book Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // =====================
  // PATIENT PORTAL
  // =====================
  renderPatientView() {
    const loggedInView = document.getElementById('patient-logged-in-view');
    const loggedOutView = document.getElementById('patient-logged-out-view');

    if (this.state.currentUser) {
      loggedInView.style.display = 'block';
      loggedOutView.style.display = 'none';

      document.getElementById('patient-welcome-name').textContent = this.state.currentUser.name;
      document.getElementById('patient-display-id').textContent = `#${this.state.currentUser.userId}`;
      document.getElementById('patient-display-email').textContent = this.state.currentUser.email || '-';
      document.getElementById('patient-display-phone').textContent = this.state.currentUser.mobileNumber || '-';
      document.getElementById('patient-avatar-initial').textContent = (this.state.currentUser.name || 'U').charAt(0).toUpperCase();

      this.loadPatientBookings();
    } else {
      loggedInView.style.display = 'none';
      loggedOutView.style.display = 'block';
    }
  },

  async loadPatientBookings() {
    if (!this.state.currentUser) return;

    const loading = document.getElementById('patient-bookings-loading');
    const container = document.getElementById('patient-bookings-table-container');
    const empty = document.getElementById('patient-bookings-empty');
    const tbody = document.getElementById('patient-bookings-tbody');

    loading.style.display = 'block';
    container.style.display = 'none';
    empty.style.display = 'none';

    try {
      const bookings = await API.getUserBookings(this.state.currentUser.userId);
      loading.style.display = 'none';

      if (!bookings || bookings.length === 0) {
        empty.style.display = 'block';
      } else {
        container.style.display = 'block';
        tbody.innerHTML = bookings.map(b => {
          const isCancelled = b.status === 'CANCELLED';
          const badgeClass = `status-badge-${b.status || 'BOOKED'}`;
          return `
            <tr>
              <td><span class="badge bg-light text-dark border">#${b.bookingId}</span></td>
              <td><strong>${this.escapeHtml(b.coachName || 'Dr. Specialist')}</strong></td>
              <td><span class="badge bg-info-subtle text-info-emphasis">${this.escapeHtml(b.specialty || '-')}</span></td>
              <td><i class="bi bi-calendar3 me-1 text-primary"></i> ${b.appointmentDate}</td>
              <td><i class="bi bi-clock me-1 text-secondary"></i> ${this.escapeHtml(b.slot)}</td>
              <td><span class="badge ${badgeClass} px-2 py-1">${b.status}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-warning me-1" 
                  ${isCancelled ? 'disabled title="Cancelled bookings cannot be rescheduled"' : ''}
                  onclick='app.openRescheduleModal(${JSON.stringify(b)})'>
                  <i class="bi bi-pencil-square"></i> Reschedule
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                  ${isCancelled ? 'disabled title="Already cancelled"' : ''}
                  onclick="app.confirmCancelBooking(${b.bookingId})">
                  <i class="bi bi-x-circle"></i> Cancel
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      loading.style.display = 'none';
      this.showAlert(`Failed to load patient appointments: ${err.message}`, 'danger');
    }
  },

  // =====================
  // COACH PORTAL
  // =====================
  renderCoachView() {
    const loggedInView = document.getElementById('coach-logged-in-view');
    const loggedOutView = document.getElementById('coach-logged-out-view');

    if (this.state.currentCoach) {
      loggedInView.style.display = 'block';
      loggedOutView.style.display = 'none';

      document.getElementById('coach-welcome-name').textContent = this.state.currentCoach.name;
      document.getElementById('coach-display-id').textContent = `#${this.state.currentCoach.coachId}`;
      document.getElementById('coach-display-specialty').textContent = this.state.currentCoach.specialty || 'Healthcare Specialist';
      document.getElementById('coach-display-phone').textContent = this.state.currentCoach.mobileNumber || '-';
      document.getElementById('coach-avatar-initial').textContent = (this.state.currentCoach.name || 'C').replace('Dr. ', '').charAt(0).toUpperCase();

      this.loadCoachBookings();
    } else {
      loggedInView.style.display = 'none';
      loggedOutView.style.display = 'block';
    }
  },

  async loadCoachBookings() {
    if (!this.state.currentCoach) return;

    const loading = document.getElementById('coach-bookings-loading');
    const container = document.getElementById('coach-bookings-table-container');
    const empty = document.getElementById('coach-bookings-empty');
    const tbody = document.getElementById('coach-bookings-tbody');

    loading.style.display = 'block';
    container.style.display = 'none';
    empty.style.display = 'none';

    try {
      const bookings = await API.getCoachBookings(this.state.currentCoach.coachId);
      loading.style.display = 'none';

      if (!bookings || bookings.length === 0) {
        empty.style.display = 'block';
      } else {
        container.style.display = 'block';
        tbody.innerHTML = bookings.map(b => {
          const badgeClass = `status-badge-${b.status || 'BOOKED'}`;
          return `
            <tr>
              <td><span class="badge bg-light text-dark border">#${b.bookingId}</span></td>
              <td><strong>${this.escapeHtml(b.userName || 'Patient')}</strong></td>
              <td><span class="badge bg-secondary-subtle text-dark">User #${b.userId}</span></td>
              <td><i class="bi bi-calendar3 me-1 text-primary"></i> ${b.appointmentDate}</td>
              <td><i class="bi bi-clock me-1 text-secondary"></i> ${this.escapeHtml(b.slot)}</td>
              <td><span class="badge ${badgeClass} px-2 py-1">${b.status}</span></td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      loading.style.display = 'none';
      this.showAlert(`Failed to load coach bookings: ${err.message}`, 'danger');
    }
  },

  // =====================
  // AUTHENTICATION & LOGIN
  // =====================
  openUserLoginModal() {
    this.modals['modal-user-login'].show();
  },

  openCoachLoginModal() {
    this.modals['modal-coach-login'].show();
  },

  switchToUserRegister() {
    this.modals['modal-user-login'].hide();
    this.showTab('register-user');
  },

  switchToCoachRegister() {
    this.modals['modal-coach-login'].hide();
    this.showTab('register-coach');
  },

  quickFillUserLogin(id, password) {
    document.getElementById('login-user-id').value = id;
    document.getElementById('login-user-password').value = password;
  },

  quickFillCoachLogin(id, password) {
    document.getElementById('login-coach-id').value = id;
    document.getElementById('login-coach-password').value = password;
  },

  async quickDemoUserLogin() {
    this.quickFillUserLogin('1', 'Rahul@123');
    await this.performUserLogin('1', 'Rahul@123');
  },

  async quickDemoCoachLogin() {
    this.quickFillCoachLogin('1', 'Priya@123');
    await this.performCoachLogin('1', 'Priya@123');
  },

  async handleUserLogin(e) {
    e.preventDefault();
    const id = document.getElementById('login-user-id').value.trim();
    const password = document.getElementById('login-user-password').value;

    const spinner = document.getElementById('spinner-login-user');
    const btn = document.getElementById('btn-login-user');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      await this.performUserLogin(id, password);
      this.modals['modal-user-login'].hide();
    } catch (err) {
      this.showAlert(`Login failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  async performUserLogin(id, password) {
    const res = await API.loginUser({ id, password });
    if (res.status) {
      // Determine user details
      let userData = null;
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId) && numericId > 0) {
        try {
          userData = await API.getUserProfile(numericId);
        } catch {
          userData = { userId: numericId, name: `User #${numericId}`, email: '' };
        }
      } else {
        // Logged in with email or phone - default to user profile 1 or identifier
        userData = { userId: 1, name: id, email: id };
      }

      this.state.currentUser = userData;
      this.state.currentCoach = null; // Single active role
      sessionStorage.setItem('wecare_user', JSON.stringify(userData));
      sessionStorage.removeItem('wecare_coach');

      this.updateAuthNav();
      this.showTab('patient');
      this.showAlert(`Welcome back, ${userData.name}! Login successful.`, 'success');
    }
  },

  logoutUser() {
    this.state.currentUser = null;
    sessionStorage.removeItem('wecare_user');
    this.updateAuthNav();
    this.renderPatientView();
    this.showAlert('Logged out successfully.', 'info');
  },

  async handleCoachLogin(e) {
    e.preventDefault();
    const id = document.getElementById('login-coach-id').value.trim();
    const password = document.getElementById('login-coach-password').value;

    const spinner = document.getElementById('spinner-login-coach');
    const btn = document.getElementById('btn-login-coach');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      await this.performCoachLogin(id, password);
      this.modals['modal-coach-login'].hide();
    } catch (err) {
      this.showAlert(`Coach login failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  async performCoachLogin(id, password) {
    const res = await API.loginCoach({ id, password });
    if (res.status) {
      let coachData = null;
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId) && numericId > 0) {
        try {
          coachData = await API.getCoachProfile(numericId);
        } catch {
          coachData = { coachId: numericId, name: `Coach #${numericId}`, specialty: 'Doctor' };
        }
      } else {
        // Mobile login - match existing loaded coaches
        const matched = this.state.coaches.find(c => c.mobileNumber === id);
        coachData = matched || { coachId: 1, name: 'Coach', specialty: 'Doctor' };
      }

      this.state.currentCoach = coachData;
      this.state.currentUser = null;
      sessionStorage.setItem('wecare_coach', JSON.stringify(coachData));
      sessionStorage.removeItem('wecare_user');

      this.updateAuthNav();
      this.showTab('coach');
      this.showAlert(`Welcome back, ${coachData.name}! Coach login successful.`, 'success');
    }
  },

  logoutCoach() {
    this.state.currentCoach = null;
    sessionStorage.removeItem('wecare_coach');
    this.updateAuthNav();
    this.renderCoachView();
    this.showAlert('Logged out of coach account.', 'info');
  },

  // =====================
  // REGISTRATIONS
  // =====================
  async handleUserRegistration(e) {
    e.preventDefault();

    const userData = {
      name: document.getElementById('reg-user-name').value.trim(),
      password: document.getElementById('reg-user-password').value,
      gender: document.getElementById('reg-user-gender').value,
      dateOfBirth: document.getElementById('reg-user-dob').value,
      mobileNumber: document.getElementById('reg-user-mobile').value.trim(),
      email: document.getElementById('reg-user-email').value.trim(),
      pincode: document.getElementById('reg-user-pincode').value.trim(),
      city: document.getElementById('reg-user-city').value.trim(),
      state: document.getElementById('reg-user-state').value.trim(),
      country: document.getElementById('reg-user-country').value.trim()
    };

    const spinner = document.getElementById('spinner-reg-user');
    const btn = document.getElementById('btn-submit-reg-user');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const res = await API.registerUser(userData);
      document.getElementById('form-register-user').reset();

      this.showAlert(`
        <strong>Registration Successful!</strong><br>
        Your generated Patient User ID is: <span class="badge bg-primary fs-6">#${res.userId}</span>.<br>
        <button class="btn btn-sm btn-outline-primary mt-2" onclick="app.quickLoginAfterRegistration(${res.userId}, '${userData.password}')">
          <i class="bi bi-box-arrow-in-right me-1"></i> Login Now with ID #${res.userId}
        </button>
      `, 'success', 15000);

      this.showTab('patient');
    } catch (err) {
      this.showAlert(`Registration failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  quickLoginAfterRegistration(userId, password) {
    this.quickFillUserLogin(userId, password);
    this.performUserLogin(userId.toString(), password);
  },

  async handleCoachRegistration(e) {
    e.preventDefault();

    const coachData = {
      name: document.getElementById('reg-coach-name').value.trim(),
      password: document.getElementById('reg-coach-password').value,
      gender: document.getElementById('reg-coach-gender').value,
      dateOfBirth: document.getElementById('reg-coach-dob').value,
      mobileNumber: document.getElementById('reg-coach-mobile').value.trim(),
      specialty: document.getElementById('reg-coach-specialty').value
    };

    const spinner = document.getElementById('spinner-reg-coach');
    const btn = document.getElementById('btn-submit-reg-coach');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const res = await API.registerCoach(coachData);
      document.getElementById('form-register-coach').reset();

      // Refresh coaches directory
      await this.loadCoaches();

      this.showAlert(`
        <strong>Coach Registered Successfully!</strong><br>
        Your generated Coach ID is: <span class="badge bg-info fs-6 text-white">#${res.coachId}</span>.<br>
        You can now receive consultation appointments.
        <br>
        <button class="btn btn-sm btn-outline-info mt-2" onclick="app.quickCoachLoginAfterReg(${res.coachId}, '${coachData.password}')">
          <i class="bi bi-shield-lock me-1"></i> Login Now as Coach #${res.coachId}
        </button>
      `, 'success', 15000);

      this.showTab('coach');
    } catch (err) {
      this.showAlert(`Coach registration failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  quickCoachLoginAfterReg(coachId, password) {
    this.quickFillCoachLogin(coachId, password);
    this.performCoachLogin(coachId.toString(), password);
  },

  // =====================
  // APPOINTMENT BOOKING
  // =====================
  openBookModal() {
    const userInput = document.getElementById('book-user-id');
    const userHint = document.getElementById('book-user-hint');

    if (this.state.currentUser) {
      userInput.value = this.state.currentUser.userId;
      userInput.readOnly = true;
      userHint.textContent = `Auto-filled for logged in patient: ${this.state.currentUser.name}`;
    } else {
      userInput.value = '';
      userInput.readOnly = false;
      userHint.innerHTML = 'Enter your User ID (or <a href="#" onclick="app.openUserLoginModal(); return false;">login first</a>)';
    }

    this.modals['modal-book-appointment'].show();
  },

  openBookModalWithCoach(coachId) {
    this.openBookModal();
    const coachSelect = document.getElementById('book-coach-id');
    if (coachSelect) coachSelect.value = coachId;
  },

  async handleBookAppointment(e) {
    e.preventDefault();

    const bookingData = {
      userId: parseInt(document.getElementById('book-user-id').value, 10),
      coachId: parseInt(document.getElementById('book-coach-id').value, 10),
      appointmentDate: document.getElementById('book-date').value,
      slot: document.getElementById('book-slot').value
    };

    const spinner = document.getElementById('spinner-book');
    const btn = document.getElementById('btn-submit-book');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      const res = await API.bookAppointment(bookingData);
      this.modals['modal-book-appointment'].hide();

      this.showAlert(`
        <strong>Appointment Booked Successfully!</strong><br>
        Booking Reference: <span class="badge bg-success">#${res.bookingId}</span> on ${bookingData.appointmentDate} for slot ${bookingData.slot}.
      `, 'success', 10000);

      // Refresh views if applicable
      if (this.state.currentUser) {
        this.loadPatientBookings();
      }
      if (this.state.currentCoach) {
        this.loadCoachBookings();
      }
    } catch (err) {
      this.showAlert(`Booking failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  // =====================
  // RESCHEDULE APPOINTMENT
  // =====================
  openRescheduleModal(booking) {
    document.getElementById('reschedule-booking-id').value = booking.bookingId;
    document.getElementById('reschedule-user-id').value = booking.userId;
    document.getElementById('reschedule-coach-id').value = booking.coachId;

    document.getElementById('reschedule-display-booking-id').textContent = `#${booking.bookingId}`;
    document.getElementById('reschedule-display-coach').textContent = `${booking.coachName} (${booking.specialty || ''})`;

    document.getElementById('reschedule-date').value = booking.appointmentDate || '';
    document.getElementById('reschedule-slot').value = booking.slot || '';

    this.modals['modal-reschedule'].show();
  },

  async handleRescheduleAppointment(e) {
    e.preventDefault();

    const bookingId = document.getElementById('reschedule-booking-id').value;
    const bookingData = {
      userId: parseInt(document.getElementById('reschedule-user-id').value, 10),
      coachId: parseInt(document.getElementById('reschedule-coach-id').value, 10),
      appointmentDate: document.getElementById('reschedule-date').value,
      slot: document.getElementById('reschedule-slot').value
    };

    const spinner = document.getElementById('spinner-reschedule');
    const btn = document.getElementById('btn-submit-reschedule');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      await API.rescheduleAppointment(bookingId, bookingData);
      this.modals['modal-reschedule'].hide();

      this.showAlert(`Appointment #${bookingId} rescheduled successfully to ${bookingData.appointmentDate} (${bookingData.slot}).`, 'success');

      if (this.state.currentUser) this.loadPatientBookings();
      if (this.state.currentCoach) this.loadCoachBookings();
    } catch (err) {
      this.showAlert(`Reschedule failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
    }
  },

  // =====================
  // CANCEL APPOINTMENT
  // =====================
  confirmCancelBooking(bookingId) {
    this.state.pendingCancelBookingId = bookingId;
    document.getElementById('cancel-display-booking-id').textContent = `#${bookingId}`;
    this.modals['modal-cancel-confirm'].show();
  },

  async executeCancelAppointment() {
    const bookingId = this.state.pendingCancelBookingId;
    if (!bookingId) return;

    const spinner = document.getElementById('spinner-cancel');
    const btn = document.getElementById('btn-confirm-cancel');
    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
      await API.cancelAppointment(bookingId);
      this.modals['modal-cancel-confirm'].hide();
      this.showAlert(`Appointment #${bookingId} has been successfully cancelled.`, 'warning');

      if (this.state.currentUser) this.loadPatientBookings();
      if (this.state.currentCoach) this.loadCoachBookings();
    } catch (err) {
      this.showAlert(`Cancellation failed: ${err.message}`, 'danger');
    } finally {
      spinner.classList.add('d-none');
      btn.disabled = false;
      this.state.pendingCancelBookingId = null;
    }
  },

  // =====================
  // COACH DETAILS MODAL
  // =====================
  async openCoachDetailsModal(coachId) {
    try {
      const coach = await API.getCoachProfile(coachId);
      this.state.selectedCoachForModal = coach;

      const initial = (coach.name || 'D').replace('Dr. ', '').charAt(0).toUpperCase();
      document.getElementById('modal-coach-avatar').textContent = initial;
      document.getElementById('modal-coach-name').textContent = coach.name;
      document.getElementById('modal-coach-specialty').textContent = coach.specialty;
      document.getElementById('modal-coach-id').textContent = `#${coach.coachId}`;
      document.getElementById('modal-coach-gender').textContent = coach.gender === 'F' ? 'Female' : 'Male';
      document.getElementById('modal-coach-dob').textContent = coach.dateOfBirth;
      document.getElementById('modal-coach-mobile').textContent = coach.mobileNumber;

      this.modals['modal-coach-details'].show();
    } catch (err) {
      this.showAlert(`Could not load coach profile: ${err.message}`, 'danger');
    }
  },

  bookFromCoachModal() {
    this.modals['modal-coach-details'].hide();
    if (this.state.selectedCoachForModal) {
      this.openBookModalWithCoach(this.state.selectedCoachForModal.coachId);
    } else {
      this.openBookModal();
    }
  },

  // =====================
  // UI UTILITIES
  // =====================
  showAlert(message, type = 'info', timeout = 6000) {
    const container = document.getElementById('global-alert-container');
    if (!container) return;

    const alertId = `alert-${Date.now()}`;
    const alertHtml = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        <div class="d-flex align-items-center">
          <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-octagon-fill' : 'bi-info-circle-fill'} me-2 fs-5"></i>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;

    container.innerHTML = alertHtml;

    if (timeout > 0) {
      setTimeout(() => {
        const el = document.getElementById(alertId);
        if (el && window.bootstrap) {
          const bsAlert = bootstrap.Alert.getOrCreateInstance(el);
          bsAlert.close();
        }
      }, timeout);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
