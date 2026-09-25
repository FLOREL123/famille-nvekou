// ============================================
// APPLICATION PRINCIPALE
// ============================================

class App {
    constructor() {
        this.currentUser = null;
        this.souvenirs = [];
        this.currentSlide = 0;
        this.carouselTimer = null;
        this.init();
    }

    // ============ INITIALISATION ============
    init() {
        this.setupImageFallbacks();
        this.setupNavigation();
        this.setupHeroCarousel();
        this.setupSearch();
        this.setupEvents();
        this.setupEditProfile();
        this.setupPDF();
        this.setupUploadPhoto();
        this.loadSouvenirs();
        this.loadPastEvents();
        this.setupFilters();
        window.app = this;
    }

    // ============ FALLBACK IMAGES ============
    setupImageFallbacks() {
        document.querySelectorAll('img[data-fallback]').forEach(img => {
            img.addEventListener('error', () => {
                if (img.dataset.fallbackApplied) return;
                img.dataset.fallbackApplied = 'true';
                const text = img.dataset.fallback || "N'VEKOUNOU";
                img.src = this.generatePlaceholder(text);
            });
        });
    }

    // ============ GÉNÉRATEURS SVG ============
    generatePlaceholder(text, bgColor = '#8B0000', textColor = '#FFFFFF') {
        const safeText = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#5C0000;stop-opacity:1" />
                </linearGradient>
                <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.5" fill="${textColor}" opacity="0.15"/>
                </pattern>
            </defs>
            <rect width="600" height="400" fill="url(#grad)"/>
            <rect width="600" height="400" fill="url(#pattern)"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".35em" 
                  fill="${textColor}" font-family="Playfair Display, serif" 
                  font-size="38" font-weight="bold">${safeText}</text>
            <text x="50%" y="68%" text-anchor="middle" 
                  fill="${textColor}" font-family="Inter, sans-serif" 
                  font-size="16" opacity="0.7">Famille N'VEKOUNOU</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    generateAvatar(letter, bgColor = '#8B0000') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <defs>
                <linearGradient id="av" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#5C0000;stop-opacity:1" />
                </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="100" fill="url(#av)"/>
            <circle cx="100" cy="100" r="92" fill="none" stroke="#C9A96E" stroke-width="4"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".35em" 
                  fill="#FFFFFF" font-family="Playfair Display, serif" 
                  font-size="90" font-weight="bold">${letter}</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    // ============ NAVIGATION + MENU HAMBURGER ============
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a[data-page]');
        const pages = document.querySelectorAll('.page');
        const hamburger = document.getElementById('hamburger');
        const navLinksEl = document.getElementById('navLinks');
        const navAuthEl = document.querySelector('.nav-auth');
        const navContainer = document.querySelector('.nav-container');

        // Sauvegarder la position d'origine des boutons auth
        const originalParent = navAuthEl ? navAuthEl.parentElement : null;

        // ✅ ADAPTER LES BOUTONS AUTH SELON LA TAILLE D'ÉCRAN
        const adaptAuthButtons = () => {
            if (!navAuthEl || !navLinksEl || !navContainer) return;
            
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Sur mobile : déplacer les boutons DANS le menu hamburger
                if (navAuthEl.parentElement !== navLinksEl) {
                    navLinksEl.appendChild(navAuthEl);
                }
            } else {
                // Sur desktop : remettre les boutons à leur place d'origine
                if (originalParent && navAuthEl.parentElement !== originalParent) {
                    originalParent.insertBefore(navAuthEl, hamburger);
                }
            }
        };

        // Exécuter au chargement
        adaptAuthButtons();

        // Exécuter au redimensionnement (avec délai anti-rebond)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(adaptAuthButtons, 150);
        });

        // ✅ NAVIGATION ENTRE PAGES
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                pages.forEach(p => p.classList.remove('active'));
                const target = document.getElementById(`page-${link.dataset.page}`);
                if (target) target.classList.add('active');

                // Fermer le menu
                navLinksEl?.classList.remove('open');
                hamburger?.classList.remove('active');
                document.body.classList.remove('menu-open');

                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // ✅ HAMBURGER : OUVRIR/FERMER LE MENU
        hamburger?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinksEl?.classList.toggle('open');
            hamburger.classList.toggle('active');
            
            // Bloquer le scroll du body quand le menu est ouvert sur mobile
            if (isOpen && window.innerWidth <= 768) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        });

        // ✅ FERMER LE MENU AU CLIC EXTÉRIEUR
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && navLinksEl?.classList.contains('open')) {
                if (!navLinksEl.contains(e.target) && !hamburger?.contains(e.target)) {
                    navLinksEl.classList.remove('open');
                    hamburger?.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });

        // ✅ FERMER LE MENU APRÈS CLIC SUR UN BOUTON AUTH
        [document.getElementById('loginBtn'), 
         document.getElementById('registerBtn'), 
         document.getElementById('logoutBtn')].forEach(btn => {
            btn?.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        navLinksEl?.classList.remove('open');
                        hamburger?.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }, 150);
                }
            });
        });
    }

    // ============ CAROUSEL PRINCIPAL ============
    setupHeroCarousel() {
        const container = document.getElementById('heroCarousel');
        if (!container) return;
        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;

        const dotsContainer = document.getElementById('heroDots');

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => {
                    this.goToSlide(i);
                    this.restartCarouselTimer();
                });
                dotsContainer.appendChild(dot);
            });
        }

        document.getElementById('heroPrev')?.addEventListener('click', () => {
            this.goToSlide(this.currentSlide - 1);
            this.restartCarouselTimer();
        });
        document.getElementById('heroNext')?.addEventListener('click', () => {
            this.goToSlide(this.currentSlide + 1);
            this.restartCarouselTimer();
        });

        this.startCarouselTimer();

        container.addEventListener('mouseenter', () => clearInterval(this.carouselTimer));
        container.addEventListener('mouseleave', () => this.startCarouselTimer());
    }

    goToSlide(index) {
        const container = document.getElementById('heroCarousel');
        if (!container) return;
        const slides = container.querySelectorAll('.carousel-slide');
        const dotsContainer = document.getElementById('heroDots');

        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        this.currentSlide = index;

        container.style.transform = `translateX(-${index * 100}%)`;
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
    }

    startCarouselTimer() {
        clearInterval(this.carouselTimer);
        this.carouselTimer = setInterval(() => {
            this.goToSlide(this.currentSlide + 1);
        }, 5000);
    }

    restartCarouselTimer() {
        clearInterval(this.carouselTimer);
        this.startCarouselTimer();
    }

    // ============ SOUVENIRS ============
    loadSouvenirs() {
        this.souvenirs = [
            {
                id: 1,
                type: 'photo',
                title: 'Cérémonie 2024',
                date: '2024-01-15',
                src: 'assets/images/souvenir1.jpeg'
            },
            {
                id: 2,
                type: 'photo',
                title: 'Réunion familiale',
                date: '2024-02-20',
                src: 'assets/images/souvenir2.jpeg'
            },
            {
                id: 3,
                type: 'photo',
                title: 'Assemblée de famille',
                date: '2024-03-10',
                src: 'assets/images/souvenir4.jpeg'
            },
            {
                id: 4,
                type: 'photo',
                title: 'Les anciens',
                date: '2024-03-10',
                src: 'assets/images/souvenir6.jpeg'
            }
        ];

        this.renderSouvenirs('all');
    }

    renderSouvenirs(filter) {
        const gallery = document.getElementById('souvenirsGallery');
        if (!gallery) return;

        const filtered = filter === 'all'
            ? this.souvenirs
            : this.souvenirs.filter(s => s.type === filter);

        if (filtered.length === 0) {
            gallery.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:2rem;">Aucun souvenir pour le moment.</p>';
            return;
        }

        gallery.innerHTML = filtered.map(s => {
            const safeTitle = this.escape(s.title);
            const safeDate = this.escape(s.date);

            if (s.type === 'video') {
                const poster = s.poster || '';
                return `
                    <div class="souvenir-item" data-id="${s.id}">
                        <span class="souvenir-type-badge video">▶ Vidéo</span>
                        <video src="${s.src}" ${poster ? `poster="${poster}"` : ''} muted preload="metadata" style="pointer-events:none;"></video>
                        <div class="souvenir-overlay">
                            <div class="souvenir-title">${safeTitle}</div>
                            <div class="souvenir-date">${safeDate}</div>
                        </div>
                    </div>
                `;
            }
            return `
                <div class="souvenir-item" data-id="${s.id}">
                    <span class="souvenir-type-badge photo">📷 Photo</span>
                    <img src="${s.src}" alt="${safeTitle}" data-fallback="${safeTitle}" />
                    <div class="souvenir-overlay">
                        <div class="souvenir-title">${safeTitle}</div>
                        <div class="souvenir-date">${safeDate}</div>
                    </div>
                </div>
            `;
        }).join('');

        gallery.querySelectorAll('.souvenir-item').forEach(item => {
            item.style.cursor = 'zoom-in';
            item.addEventListener('click', () => {
                this.openLightbox(parseInt(item.dataset.id));
            });
        });

        this.setupImageFallbacks();
    }

    openLightbox(id) {
        const souvenir = this.souvenirs.find(s => s.id === id);
        if (!souvenir) return;

        let lightbox = document.getElementById('souvenirLightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'souvenirLightbox';
            lightbox.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.95);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                cursor: zoom-out;
            `;
            lightbox.innerHTML = `
                <button class="lightbox-close" style="position:absolute;top:20px;right:30px;background:white;border:none;width:44px;height:44px;border-radius:50%;font-size:1.5rem;cursor:pointer;color:#8B0000;line-height:1;">&times;</button>
                <div class="lightbox-content" style="max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;"></div>
            `;
            document.body.appendChild(lightbox);

            const closeBtn = lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeLightbox();
            });
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) this.closeLightbox();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeLightbox();
            });
        }

        const content = lightbox.querySelector('.lightbox-content');
        if (souvenir.type === 'video') {
            content.innerHTML = `<video src="${souvenir.src}" controls autoplay style="max-width:100%;max-height:85vh;border-radius:12px;"></video>`;
        } else {
            content.innerHTML = `<img src="${souvenir.src}" alt="${this.escape(souvenir.title)}" style="max-width:100%;max-height:85vh;border-radius:12px;" />`;
        }

        lightbox.style.display = 'flex';
    }

    closeLightbox() {
        const lightbox = document.getElementById('souvenirLightbox');
        if (!lightbox) return;
        const video = lightbox.querySelector('video');
        if (video) video.pause();
        lightbox.style.display = 'none';
    }

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderSouvenirs(btn.dataset.filter);
            });
        });
    }

    // ============ ÉVÉNEMENTS PASSÉS (ACCUEIL) ============
    loadPastEvents() {
        const pastEvents = [
            {
                id: 1,
                title: 'Cérémonie Vodounon',
                date: '2024-01-15',
                location: 'Lomé',
                image: 'assets/images/souvenirs/ceremonie-1.jpg'
            },
            {
                id: 2,
                title: 'Réunion de Famille',
                date: '2024-02-20',
                location: 'Aného',
                image: 'assets/images/souvenirs/ceremonie-2.jpg'
            }
        ];

        const container = document.getElementById('pastEventsCarousel');
        if (!container) return;

        container.innerHTML = pastEvents.map(event => `
            <div class="past-event-card">
                <img src="${event.image}" alt="${this.escape(event.title)}" data-fallback="${this.escape(event.title)}" />
                <div class="event-content">
                    <div class="event-title">${this.escape(event.title)}</div>
                    <div class="event-date">${new Date(event.date).toLocaleDateString('fr-FR')}</div>
                    <div style="font-size:0.9rem;color:#666;">${this.escape(event.location)}</div>
                </div>
            </div>
        `).join('');

        this.setupImageFallbacks();
    }

    // ============ RECHERCHE MEMBRES ============
    setupSearch() {
        const searchInput = document.getElementById('memberSearch');
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => this.filterMembers(e.target.value.toLowerCase()));
    }

    filterMembers(query) {
        document.querySelectorAll('.member-card').forEach(card => {
            const name = (card.dataset.name || '').toLowerCase();
            const job = (card.dataset.job || '').toLowerCase();
            card.style.display = (name.includes(query) || job.includes(query)) ? '' : 'none';
        });
    }

    // ============ ÉVÉNEMENTS UTILISATEUR ============
    setupEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadEvents(btn.dataset.tab);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-participate')) {
                this.toggleParticipation(e.target);
            }
        });
    }

    loadEvents(type = 'passe') {
        const container = document.getElementById('eventsList');
        if (!container) return;

        const eventsData = type === 'futur'
            ? [{ id: 3, title: 'Grande Réunion 2025', date: '2025-03-15', description: 'Réunion annuelle à venir' }]
            : [
                { id: 1, title: 'Cérémonie Vodounon', date: '2024-01-15', description: 'Cérémonie traditionnelle' },
                { id: 2, title: 'Réunion de famille', date: '2024-02-20', description: 'Réunion annuelle' }
            ];

        if (eventsData.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Aucun événement.</p>';
            return;
        }

        container.innerHTML = eventsData.map(event => `
            <div class="event-item">
                <div class="event-info">
                    <div class="event-title">${this.escape(event.title)}</div>
                    <div class="event-date">${new Date(event.date).toLocaleDateString('fr-FR')}</div>
                    <div class="event-desc">${this.escape(event.description)}</div>
                </div>
                <div class="event-actions">
                    <button type="button" class="btn-participate" data-event-id="${event.id}">
                        ${type === 'futur' ? 'Participer' : 'Participe ✓'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleParticipation(button) {
        const isPart = button.classList.contains('participating');
        button.classList.toggle('participating', !isPart);
        button.textContent = isPart ? 'Participer' : 'Je participe ✓';
        auth.showToast(
            isPart ? 'Participation retirée' : 'Vous participez à cet événement!',
            isPart ? 'info' : 'success'
        );
    }

    // ============ ÉDITION PROFIL UTILISATEUR ============
    setupEditProfile() {
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            if (!auth.currentUser) {
                auth.showToast('Veuillez vous connecter pour modifier votre profil', 'error');
                return;
            }
            this.openEditModal();
        });

        document.getElementById('closeEdit')?.addEventListener('click', () => {
            document.getElementById('editProfileModal')?.classList.remove('show');
        });

        document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    }

    openEditModal() {
        const user = auth.currentUser;
        if (!user) return;

        document.getElementById('editFirstName').value = user.firstName || '';
        document.getElementById('editFather').value = user.father || '';
        document.getElementById('editMother').value = user.mother || '';
        document.getElementById('editJob').value = user.job || '';
        document.getElementById('editLocation').value = user.location || '';
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editChildren').value = (user.children || []).join(', ');
        document.getElementById('editSpouse').value = user.spouse || '';

        document.getElementById('editProfileModal').classList.add('show');
    }

    async saveProfile() {
        const user = auth.currentUser;
        if (!user) return;

        user.firstName = document.getElementById('editFirstName').value;
        user.father = document.getElementById('editFather').value;
        user.mother = document.getElementById('editMother').value;
        user.job = document.getElementById('editJob').value;
        user.location = document.getElementById('editLocation').value;
        user.phone = document.getElementById('editPhone').value;
        user.children = document.getElementById('editChildren').value.split(',').map(c => c.trim()).filter(Boolean);
        user.spouse = document.getElementById('editSpouse').value;

        const photoFile = document.getElementById('editPhoto').files[0];
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                user.photo = e.target.result;
                document.getElementById('userAvatar').src = e.target.result;
            };
            reader.readAsDataURL(photoFile);
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateProfileUI(user);
        document.getElementById('editProfileModal').classList.remove('show');
        auth.showToast('Profil mis à jour avec succès!', 'success');
    }

    // ============ UPLOAD PHOTO RAPIDE ============
    setupUploadPhoto() {
        document.getElementById('uploadPhotoBtn')?.addEventListener('click', () => {
            if (!auth.currentUser) {
                auth.showToast('Veuillez vous connecter d\'abord', 'error');
                return;
            }
            document.getElementById('photoUpload').click();
        });

        document.getElementById('photoUpload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                auth.currentUser.photo = ev.target.result;
                document.getElementById('userAvatar').src = ev.target.result;
                localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
                auth.showToast('Photo mise à jour!', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    updateProfile(user) {
        this.updateProfileUI(user);
    }

    updateProfileUI(user) {
        if (!user) return;
        document.getElementById('userFullName').textContent = `${user.firstName || ''} ${user.familyName || "N'VEKOUNOU"}`;
        document.getElementById('userPosition').textContent = this.getPositionLabel(user.position || 'membre');
        document.getElementById('userBirthdate').textContent = user.birthdate ? new Date(user.birthdate).toLocaleDateString('fr-FR') : '--';
        document.getElementById('userLocation').textContent = user.location || '--';
        document.getElementById('userJob').textContent = user.job || '--';
        document.getElementById('userPhone').textContent = user.phone || '--';
        document.getElementById('userFather').textContent = user.father || '--';
        document.getElementById('userMother').textContent = user.mother || '--';
        document.getElementById('userChildren').textContent = (user.children || []).join(', ') || 'Aucun';
        document.getElementById('userPositionDetail').textContent = this.getPositionLabel(user.position || 'membre');

        if (user.photo) {
            document.getElementById('userAvatar').src = user.photo;
        }

        const positionsWithIntronisation = ['dah', 'baba_kouboulo', 'vigan', 'saranon', 'tangnis', 'tangno', 'otoun', 'adjanan'];
        const intronisationDisplay = document.getElementById('intronisationDisplay');
        if (user.intronisation && positionsWithIntronisation.includes(user.position)) {
            intronisationDisplay.style.display = 'flex';
            document.getElementById('userIntronisation').textContent = new Date(user.intronisation).toLocaleDateString('fr-FR');
        } else {
            intronisationDisplay.style.display = 'none';
        }
    }

    getPositionLabel(position) {
        const labels = {
            'membre': 'Membre', 'dah': 'Dah', 'baba_kouboulo': 'Baba KOUBOULOU',
            'vigan': 'Vigan', 'saranon': 'Saranon', 'tangnis': 'Tangnis',
            'tangno': 'Tangno', 'otoun': 'Otoun', 'adjanan': 'ADJANAN'
        };
        return labels[position] || position;
    }

    resetProfile() {
        document.getElementById('userFullName').textContent = 'Nom Prénom';
        document.getElementById('userPosition').textContent = 'Membre';
        document.getElementById('userBirthdate').textContent = '--';
        document.getElementById('userLocation').textContent = '--';
        document.getElementById('userJob').textContent = '--';
        document.getElementById('userPhone').textContent = '--';
        document.getElementById('userFather').textContent = '--';
        document.getElementById('userMother').textContent = '--';
        document.getElementById('userChildren').textContent = '--';
        document.getElementById('userPositionDetail').textContent = '--';
        document.getElementById('intronisationDisplay').style.display = 'none';
    }

    async loadUserData() {
        if (!auth.currentUser) return;
        this.updateProfileUI(auth.currentUser);
        this.loadEvents('passe');
        this.loadMembers();
    }

    loadMembers() {
        const membersData = [
            { id: 1, name: "Koffi N'VEKOUNOU", job: 'Enseignant', phone: '+228 90000000', letter: 'K', deceased: false },
            { id: 2, name: "Ama N'VEKOUNOU", job: 'Médecin', phone: '+228 90000001', letter: 'A', deceased: false },
            { id: 3, name: "Tété N'VEKOUNOU", job: 'Ingénieur', phone: '+228 90000002', letter: 'T', deceased: false }
        ];

        const container = document.getElementById('membersGrid');
        if (!container) return;

        container.innerHTML = membersData.map(m => `
            <div class="member-card ${m.deceased ? 'member-deceased' : ''}" data-name="${m.name}" data-job="${m.job}">
                <img src="${this.generateAvatar(m.letter)}" alt="${m.name}" />
                <div class="member-name">${m.name}</div>
                <div class="member-detail">${m.job}</div>
                <div class="member-detail">${m.phone}</div>
            </div>
        `).join('');
    }

    // ============ PDF ============
    setupPDF() {
        document.getElementById('generatePdfBtn')?.addEventListener('click', () => this.generatePDF());
    }

    generatePDF() {
        const user = auth.currentUser;
        if (!user) {
            auth.showToast('Veuillez vous connecter pour générer votre carte', 'error');
            return;
        }
        auth.showToast('Génération de la carte en cours...', 'info');
        setTimeout(() => auth.showToast('Carte de membre générée!', 'success'), 1000);
    }

    // ============ UTILITAIRES ============
    escape(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('show');
    }
}

// ============ LANCEMENT ============
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});