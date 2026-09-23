// Gestion de l'authentification
const API_URL = 'http://localhost:5000/api';

class Auth {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        if (this.token) {
            this.verifyToken();
        }

        document.getElementById('loginBtn').addEventListener('click', () => this.openModal('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.openModal('register'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        document.getElementById('closeLogin').addEventListener('click', () => this.closeModal('login'));
        document.getElementById('closeRegister').addEventListener('click', () => this.closeModal('register'));

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        document.getElementById('regPosition').addEventListener('change', (e) => {
            const position = e.target.value;
            const intronisationGroup = document.getElementById('intronisationGroup');
            const positionsWithIntronisation = ['dah', 'baba_kouboulo', 'vigan', 'saranon', 'tangnis', 'tangno', 'otoun', 'adjanan'];
            if (positionsWithIntronisation.includes(position)) {
                intronisationGroup.style.display = 'block';
                document.getElementById('regIntronisation').required = true;
            } else {
                intronisationGroup.style.display = 'none';
                document.getElementById('regIntronisation').required = false;
            }
        });
    }

    async verifyToken() {
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUI(true);
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Erreur de vérification:', error);
            this.logout();
        }
    }

    openModal(type) {
        const modalId = type === 'login' ? 'loginModal' : 'registerModal';
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(type) {
        const modalId = type === 'login' ? 'loginModal' : 'registerModal';
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = {
                id: 1,
                firstName: 'Koffi',
                familyName: 'N\'VEKOUNOU',
                email: email,
                position: 'Dah',
                isAdmin: false,
                birthdate: '1990-01-01',
                location: 'Lomé',
                job: 'Enseignant',
                phone: '+228 90000000',
                father: 'Tété N\'VEKOUNOU',
                mother: 'Ama N\'VEKOUNOU',
                children: ['Kodjo', 'Akpene'],
                spouse: 'Yawa N\'VEKOUNOU',
                intronisation: '2020-06-15'
            };

            this.token = 'fake_token_123';
            localStorage.setItem('token', this.token);
            this.currentUser = user;
            this.updateUI(true);
            this.closeModal('login');
            this.showToast('Connexion réussie!', 'success');
            document.getElementById('loginForm').reset();
        } catch (error) {
            console.error('Erreur:', error);
            this.showToast('Erreur de connexion au serveur', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = {
            familyName: document.getElementById('regFamilyName').value,
            firstName: document.getElementById('regFirstName').value,
            father: document.getElementById('regFather').value,
            mother: document.getElementById('regMother').value,
            children: document.getElementById('regChildren').value.split(',').map(c => c.trim()).filter(Boolean),
            spouse: document.getElementById('regSpouse').value,
            birthdate: document.getElementById('regBirthdate').value,
            age: parseInt(document.getElementById('regAge').value),
            job: document.getElementById('regJob').value,
            location: document.getElementById('regLocation').value,
            phone: document.getElementById('regPhone').value,
            position: document.getElementById('regPosition').value,
            intronisation: document.getElementById('regIntronisation').value || null,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value
        };

        if (formData.familyName.toUpperCase() !== "N'VEKOUNOU") {
            this.showToast('Seuls les membres de la famille N\'VEKOUNOU peuvent s\'inscrire', 'error');
            return;
        }

        try {
            this.showToast('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
            this.closeModal('register');
            document.getElementById('registerForm').reset();
            setTimeout(() => this.openModal('login'), 500);
        } catch (error) {
            console.error('Erreur:', error);
            this.showToast('Erreur de connexion au serveur', 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        this.updateUI(false);
        this.showToast('Déconnexion réussie', 'success');
    }

    updateUI(isLoggedIn) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (isLoggedIn) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
            
            if (window.app && window.app.updateProfile) {
                window.app.updateProfile(this.currentUser);
            }
            if (window.app) {
                window.app.loadUserData();
            }
        } else {
            loginBtn.style.display = 'inline-flex';
            registerBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
            if (window.app && window.app.resetProfile) {
                window.app.resetProfile();
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast';
        if (type) toast.classList.add(type);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

const auth = new Auth();