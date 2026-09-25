// ============================================
// AUTHENTIFICATION — Famille N'VEKOUNOU
// Version : mobile-safe + sans dépendance API externe
// ============================================

// ⚠️ PLUS DE localhost — tout est géré côté client.
// Quand tu auras un backend Python déployé, ajoute ici :
// const API_URL = 'https://ton-backend.onrender.com/api';

class Auth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.storageAvailable = this.checkStorage();
        this.init();
    }

    checkStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage indisponible');
            return false;
        }
    }

    safeGet(key) {
        if (!this.storageAvailable) return null;
        try { return localStorage.getItem(key); } catch { return null; }
    }

    safeSet(key, value) {
        if (!this.storageAvailable) return false;
        try { localStorage.setItem(key, value); return true; } catch { return false; }
    }

    safeRemove(key) {
        if (!this.storageAvailable) return;
        try { localStorage.removeItem(key); } catch {}
    }

    init() {
        this.token = this.safeGet('token');
        const savedUser = this.safeGet('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI(true);
            } catch (e) {
                this.logout();
            }
        }

        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        document.addEventListener('submit', (e) => this.handleGlobalSubmit(e));

        document.addEventListener('change', (e) => {
            if (e.target.id === 'regPosition') {
                this.toggleIntronisation(e.target.value);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
                document.body.classList.remove('modal-open');
            }
        });
    }

    handleGlobalClick(e) {
        const target = e.target.closest('[id]');
        if (!target) return;
        const id = target.id;

        switch (id) {
            case 'loginBtn':      e.preventDefault(); this.openModal('login'); break;
            case 'registerBtn':   e.preventDefault(); this.openModal('register'); break;
            case 'logoutBtn':     e.preventDefault(); this.logout(); break;
            case 'closeLogin':
            case 'closeRegister':
            case 'closeEdit':
            case 'closeAdminLogin':
            case 'closeEventModal':
            case 'closePaymentModal':
            case 'closeAddMemberModal':
            case 'closeDonationModal':
            case 'closeDonationView':
            case 'closeEditMemberModal':
            case 'closeDeathModal':
            case 'cancelDeathBtn':
                e.preventDefault();
                this.closeModalById(id);
                break;
        }
    }

    handleGlobalSubmit(e) {
        const formId = e.target.id;
        const handlers = {
            'loginForm':      (ev) => this.handleLogin(ev),
            'registerForm':   (ev) => this.handleRegister(ev),
            'adminLoginForm': () => { if (window.admin) window.admin.handleAdminLogin(); }
        };
        if (handlers[formId]) {
            e.preventDefault();
            e.stopPropagation();
            handlers[formId](e);
        }
    }

    closeModalById(buttonId) {
        const map = {
            'closeLogin': 'loginModal',
            'closeRegister': 'registerModal',
            'closeEdit': 'editProfileModal',
            'closeAdminLogin': 'adminLoginModal',
            'closeEventModal': 'addEventModal',
            'closePaymentModal': 'paymentModal',
            'closeAddMemberModal': 'addMemberModal',
            'closeDonationModal': 'donationModal',
            'closeDonationView': 'donationViewModal',
            'closeEditMemberModal': 'editMemberModal',
            'closeDeathModal': 'declarDeathModal',
            'cancelDeathBtn': 'declarDeathModal'
        };
        const modalId = map[buttonId];
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    toggleIntronisation(position) {
        const group = document.getElementById('intronisationGroup');
        if (!group) return;
        const positions = ['dah', 'baba_kouboulo', 'vigan', 'saranon', 'tangnis', 'tangno', 'otoun', 'adjanan'];
        const show = positions.includes(position);
        group.style.display = show ? 'block' : 'none';
        const input = document.getElementById('regIntronisation');
        if (input) input.required = show;
    }

    openModal(type) {
        const modalId = type === 'login' ? 'loginModal' : 'registerModal';
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        setTimeout(() => {
            const content = modal.querySelector('.modal-content');
            if (content) content.scrollTop = 0;
        }, 50);
    }

    closeModal(type) {
        const modalId = type === 'login' ? 'loginModal' :
                        type === 'register' ? 'registerModal' : type;
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    async handleLogin(e) {
        if (e) e.preventDefault();
        const emailEl = document.getElementById('loginEmail');
        const passwordEl = document.getElementById('loginPassword');
        if (!emailEl || !passwordEl) return;

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        if (!email) { this.showToast('Veuillez entrer votre email', 'error'); emailEl.focus(); return; }
        if (!password) { this.showToast('Veuillez entrer votre mot de passe', 'error'); passwordEl.focus(); return; }

        try {
            const user = {
                id: 1,
                firstName: 'Koffi',
                familyName: "N'VEKOUNOU",
                email: email,
                position: 'dah',
                isAdmin: false,
                birthdate: '1990-01-15',
                location: 'Lomé',
                job: 'Enseignant',
                phone: '+228 90000000',
                father: "Tété N'VEKOUNOU",
                mother: "Ama N'VEKOUNOU",
                children: ['Kodjo', 'Akpene'],
                spouse: "Yawa N'VEKOUNOU",
                intronisation: '2020-06-15',
                photo: null
            };

            this.token = 'token_' + Date.now();
            this.safeSet('token', this.token);
            this.safeSet('currentUser', JSON.stringify(user));
            this.currentUser = user;
            this.updateUI(true);
            this.closeModal('login');
            this.showToast('Connexion réussie !', 'success');
            const form = document.getElementById('loginForm');
            if (form) form.reset();
        } catch (error) {
            console.error(error);
            this.showToast('Erreur de connexion', 'error');
        }
    }

    async handleRegister(e) {
        if (e) e.preventDefault();
        const get = (id) => document.getElementById(id);
        const familyName = get('regFamilyName')?.value || '';
        const firstName  = get('regFirstName')?.value.trim() || '';
        const father     = get('regFather')?.value.trim() || '';
        const mother     = get('regMother')?.value.trim() || '';
        const birthdate  = get('regBirthdate')?.value || '';
        const age        = get('regAge')?.value || '';
        const location   = get('regLocation')?.value.trim() || '';
        const phone      = get('regPhone')?.value.trim() || '';
        const email      = get('regEmail')?.value.trim() || '';
        const password   = get('regPassword')?.value || '';

        const errors = [];
        if (familyName.toUpperCase().replace(/['\s]/g, '') !== 'NVEKOUNOU') errors.push("Le nom de famille doit être N'VEKOUNOU");
        if (!firstName) errors.push('Le prénom est obligatoire');
        if (!father) errors.push('Le nom du père est obligatoire');
        if (!mother) errors.push('Le nom de la mère est obligatoire');
        if (!birthdate) errors.push('La date de naissance est obligatoire');
        if (!age || age < 1) errors.push("L'âge est obligatoire");
        if (!location) errors.push('Le lieu de vie est obligatoire');
        if (!phone) errors.push('Le téléphone est obligatoire');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide');
        if (password.length < 6) errors.push('Le mot de passe doit contenir au moins 6 caractères');

        if (errors.length > 0) {
            this.showToast(errors[0], 'error');
            return;
        }

        try {
            const users = JSON.parse(this.safeGet('allUsers') || '[]');
            users.push({
                id: Date.now(),
                firstName, father, mother, birthdate, age,
                location, phone, email, password,
                familyName: "N'VEKOUNOU",
                position: get('regPosition')?.value || 'membre',
                createdAt: new Date().toISOString()
            });
            this.safeSet('allUsers', JSON.stringify(users));

            this.showToast('Inscription réussie ! Connectez-vous maintenant.', 'success');
            this.closeModal('register');
            const form = document.getElementById('registerForm');
            if (form) form.reset();

            setTimeout(() => {
                this.openModal('login');
                const loginEmail = document.getElementById('loginEmail');
                if (loginEmail) loginEmail.value = email;
            }, 700);
        } catch (error) {
            console.error(error);
            this.showToast("Erreur lors de l'inscription", 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        this.safeRemove('token');
        this.safeRemove('currentUser');
        this.updateUI(false);
        this.showToast('Déconnexion réussie', 'success');
    }

    updateUI(isLoggedIn) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        if (registerBtn) registerBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
        if (isLoggedIn && window.app) window.app.loadUserData();
        else if (!isLoggedIn && window.app) window.app.resetProfile();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) { console.log(`[${type}] ${message}`); return; }
        toast.textContent = message;
        toast.className = 'toast';
        if (type) toast.classList.add(type);
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.auth = new Auth(); });
} else {
    window.auth = new Auth();
}
