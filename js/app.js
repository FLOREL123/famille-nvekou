// Application principale
class App {
    constructor() {
        this.currentUser = null;
        this.events = [];
        this.members = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupCarousels();
        this.setupSearch();
        this.setupEvents();
        this.setupEditProfile();
        this.setupPDF();
        this.loadPastEvents();
        window.app = this;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const pageId = link.dataset.page;
                pages.forEach(p => p.classList.remove('active'));
                const targetPage = document.getElementById(`page-${pageId}`);
                if (targetPage) {
                    targetPage.classList.add('active');
                }

                document.getElementById('navLinks').classList.remove('open');
                document.getElementById('hamburger').classList.remove('active');
            });
        });

        const hamburger = document.getElementById('hamburger');
        hamburger.addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('open');
            hamburger.classList.toggle('active');
        });
    }

    setupCarousels() {
        this.initCarousel('heroCarousel', 'heroPrev', 'heroNext', 'heroDots');
    }

    initCarousel(containerId, prevBtnId, nextBtnId, dotsId) {
        const container = document.getElementById(containerId);
        const slides = container.querySelectorAll('.carousel-slide');
        let currentIndex = 0;
        let interval;

        if (slides.length === 0) return;

        const dotsContainer = document.getElementById(dotsId);
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(container, slides, i, dotsContainer));
            dotsContainer.appendChild(dot);
        });

        document.getElementById(prevBtnId).addEventListener('click', () => {
            this.goToSlide(container, slides, currentIndex - 1, dotsContainer);
            clearInterval(interval);
            this.startCarousel(container, slides, dotsContainer);
        });

        document.getElementById(nextBtnId).addEventListener('click', () => {
            this.goToSlide(container, slides, currentIndex + 1, dotsContainer);
            clearInterval(interval);
            this.startCarousel(container, slides, dotsContainer);
        });

        this.startCarousel(container, slides, dotsContainer);

        container.addEventListener('mouseenter', () => clearInterval(interval));
        container.addEventListener('mouseleave', () => {
            this.startCarousel(container, slides, dotsContainer);
        });

        this.goToSlide = (container, slides, index, dotsContainer) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;
            container.style.transform = `translateX(-${index * 100}%)`;
            dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        this.startCarousel = (container, slides, dotsContainer) => {
            interval = setInterval(() => {
                this.goToSlide(container, slides, currentIndex + 1, dotsContainer);
            }, 5000);
        };
    }

    async loadPastEvents() {
        try {
            const pastEvents = [
                { id: 1, title: 'Cérémonie Vodounon', date: '2024-01-15', location: 'Lomé', image: 'https://via.placeholder.com/400x200/8B0000/FFFFFF?text=Cérémonie', description: 'Cérémonie traditionnelle annuelle' },
                { id: 2, title: 'Réunion de Famille', date: '2024-02-20', location: 'Aného', image: 'https://via.placeholder.com/400x200/5C0000/FFFFFF?text=Réunion', description: 'Réunion annuelle des membres' }
            ];

            const container = document.getElementById('pastEventsCarousel');
            container.innerHTML = pastEvents.map(event => `
                <div class="past-event-card">
                    <img src="${event.image}" alt="${event.title}" />
                    <div class="event-content">
                        <div class="event-title">${event.title}</div>
                        <div class="event-date">${new Date(event.date).toLocaleDateString('fr-FR')}</div>
                        <div style="font-size:0.9rem;color:#666;">${event.location}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement événements passés:', error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('memberSearch');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterMembers(query);
        });
    }

    filterMembers(query) {
        const cards = document.querySelectorAll('.member-card');
        cards.forEach(card => {
            const name = card.dataset.name?.toLowerCase() || '';
            const job = card.dataset.job?.toLowerCase() || '';
            const matches = name.includes(query) || job.includes(query);
            card.style.display = matches ? '' : 'none';
        });
    }

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
                const eventId = e.target.dataset.eventId;
                this.toggleParticipation(eventId, e.target);
            }
        });
    }

    async loadEvents(type = 'passe') {
        try {
            const eventsData = [
                { id: 1, title: 'Cérémonie Vodounon', date: '2024-01-15', description: 'Cérémonie traditionnelle' },
                { id: 2, title: 'Réunion de famille', date: '2024-02-20', description: 'Réunion annuelle' }
            ];

            const container = document.getElementById('eventsList');
            container.innerHTML = eventsData.map(event => `
                <div class="event-item">
                    <div class="event-info">
                        <div class="event-title">${event.title}</div>
                        <div class="event-date">${new Date(event.date).toLocaleDateString('fr-FR')}</div>
                        <div class="event-desc">${event.description}</div>
                    </div>
                    <div class="event-actions">
                        <button class="btn-participate" data-event-id="${event.id}">
                            Participer
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement événements:', error);
        }
    }

    toggleParticipation(eventId, button) {
        const isParticipating = button.classList.contains('participating');
        if (isParticipating) {
            button.classList.remove('participating');
            button.textContent = 'Participer';
            this.showToast('Vous ne participez plus à cet événement', 'info');
        } else {
            button.classList.add('participating');
            button.textContent = 'Je participe ✓';
            this.showToast('Vous participez à cet événement!', 'success');
        }
    }

    setupEditProfile() {
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            if (!auth.currentUser) {
                auth.showToast('Veuillez vous connecter pour modifier votre profil', 'error');
                return;
            }
            this.openEditModal();
        });

        document.getElementById('closeEdit').addEventListener('click', () => {
            this.closeModal('editProfileModal');
        });

        document.getElementById('editProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    openEditModal() {
        const user = auth.currentUser;
        if (!user) return;

        document.getElementById('editFirstName').value = user.firstName || '';
        document.getElementById('editJob').value = user.job || '';
        document.getElementById('editLocation').value = user.location || '';
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editChildren').value = (user.children || []).join(', ');
        document.getElementById('editSpouse').value = user.spouse || '';

        document.getElementById('editProfileModal').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    async updateProfile() {
        try {
            const updatedData = {
                firstName: document.getElementById('editFirstName').value,
                job: document.getElementById('editJob').value,
                location: document.getElementById('editLocation').value,
                phone: document.getElementById('editPhone').value,
                children: document.getElementById('editChildren').value.split(',').map(c => c.trim()).filter(Boolean),
                spouse: document.getElementById('editSpouse').value
            };

            auth.currentUser = { ...auth.currentUser, ...updatedData };
            this.updateProfileUI(auth.currentUser);
            this.closeModal('editProfileModal');
            this.showToast('Profil mis à jour avec succès!', 'success');
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            this.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    updateProfileUI(user) {
        if (!user) return;
        const fullName = `${user.firstName || ''} ${user.familyName || 'N\'VEKOUNOU'}`;
        document.getElementById('userFullName').textContent = fullName;
        document.getElementById('userPosition').textContent = this.getPositionLabel(user.position || 'membre');
        document.getElementById('userBirthdate').textContent = user.birthdate ? new Date(user.birthdate).toLocaleDateString('fr-FR') : '--';
        document.getElementById('userLocation').textContent = user.location || '--';
        document.getElementById('userJob').textContent = user.job || '--';
        document.getElementById('userPhone').textContent = user.phone || '--';
        document.getElementById('userFather').textContent = user.father || '--';
        document.getElementById('userMother').textContent = user.mother || '--';
        document.getElementById('userChildren').textContent = (user.children || []).join(', ') || 'Aucun';
        document.getElementById('userPositionDetail').textContent = this.getPositionLabel(user.position || 'membre');

        const intronisationDisplay = document.getElementById('intronisationDisplay');
        const positionsWithIntronisation = ['dah', 'baba_kouboulo', 'vigan', 'saranon', 'tangnis', 'tangno', 'otoun', 'adjanan'];
        if (user.intronisation && positionsWithIntronisation.includes(user.position)) {
            intronisationDisplay.style.display = 'flex';
            document.getElementById('userIntronisation').textContent = new Date(user.intronisation).toLocaleDateString('fr-FR');
        } else {
            intronisationDisplay.style.display = 'none';
        }
    }

    getPositionLabel(position) {
        const labels = {
            'membre': 'Membre',
            'dah': 'Dah',
            'baba_kouboulo': 'Baba KOUBOULOU',
            'vigan': 'Vigan',
            'saranon': 'Saranon',
            'tangnis': 'Tangnis',
            'tangno': 'Tangno',
            'otoun': 'Otoun',
            'adjanan': 'ADJANAN'
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

    async loadMembers() {
        try {
            const membersData = [
                { id: 1, name: 'Koffi N\'VEKOUNOU', job: 'Enseignant', phone: '+228 90000000', image: 'https://via.placeholder.com/80x80/8B0000/FFFFFF?text=K' },
                { id: 2, name: 'Ama N\'VEKOUNOU', job: 'Médecin', phone: '+228 90000001', image: 'https://via.placeholder.com/80x80/5C0000/FFFFFF?text=A' },
                { id: 3, name: 'Tété N\'VEKOUNOU', job: 'Ingénieur', phone: '+228 90000002', image: 'https://via.placeholder.com/80x80/8B0000/FFFFFF?text=T' }
            ];

            const container = document.getElementById('membersGrid');
            container.innerHTML = membersData.map(member => `
                <div class="member-card" data-name="${member.name}" data-job="${member.job}">
                    <img src="${member.image}" alt="${member.name}" />
                    <div class="member-name">${member.name}</div>
                    <div class="member-detail">${member.job}</div>
                    <div class="member-detail">${member.phone}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement membres:', error);
        }
    }

    setupPDF() {
        document.getElementById('generatePdfBtn').addEventListener('click', () => {
            this.generatePDF();
        });
    }

    generatePDF() {
        const user = auth.currentUser;
        if (!user) {
            this.showToast('Veuillez vous connecter pour générer votre carte', 'error');
            return;
        }
        this.showToast('Carte de membre générée avec succès!', 'success');
    }

    showToast(message, type = 'info') {
        auth.showToast(message, type);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});
// ============================================
// SOUVENIRS (Photos & Vidéos passées)
// ============================================

const souvenirsData = [
    {
        id: 1,
        type: 'photo',
        src: 'assets/images/souvenir1.jpeg',
        title: 'Assemblée familiale 2023',
        date: '15 Juillet 2023',
        fallback: 'https://via.placeholder.com/800x600/8B0000/FFFFFF?text=Souvenir+2023'
    },
    {
        id: 2,
        type: 'photo',
        src: 'assets/images/souvenir2.jpeg',
        title: 'Fête des récoltes',
        date: '10 Décembre 2022',
        fallback: 'https://via.placeholder.com/800x600/5C0000/FFFFFF?text=Fete+Recoltes'
    },
    {
        id: 3,
        type: 'video',
        src: 'assets/videos/souvenir1.mp4',
        poster: 'assets/images/souvenir3.jpg',
        title: "Cérémonie d'intronisation",
        date: '5 Mars 2023',
        fallback: 'https://via.placeholder.com/800x600/8B0000/FFFFFF?text=Video+Intronisation'
    },
    {
        id: 4,
        type: 'photo',
        src: 'assets/images/souvenir4.jpeg',
        title: 'Rencontre des anciens',
        date: '20 Août 2021',
        fallback: 'https://via.placeholder.com/800x600/5C0000/FFFFFF?text=Anciens'
    },
    {
        id: 5,
        type: 'video',
        src: 'assets/videos/souvenir2.mp4',
        poster: 'assets/images/souvenir5.jpg',
        title: 'Célébration des 10 ans',
        date: '1er Janvier 2024',
        fallback: 'https://via.placeholder.com/800x600/8B0000/FFFFFF?text=10+Ans'
    },
    {
        id: 6,
        type: 'photo',
        src: 'assets/images/souvenir6.jpeg',
        title: 'Sortie familiale à la plage',
        date: '12 Juin 2022',
        fallback: 'https://via.placeholder.com/800x600/5C0000/FFFFFF?text=Plage'
    }
];

function renderSouvenirs(filter = 'all') {
    const gallery = document.getElementById('souvenirsGallery');
    if (!gallery) return;

    const filtered = filter === 'all'
        ? souvenirsData
        : souvenirsData.filter(s => s.type === filter);

    if (filtered.length === 0) {
        gallery.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:#999;padding:40px;">Aucun souvenir pour le moment.</p>';
        return;
    }

    gallery.innerHTML = filtered.map(s => {
        if (s.type === 'video') {
            return `
                <div class="souvenir-item" data-id="${s.id}" data-type="video">
                    <span class="souvenir-badge video-badge"><i class="fas fa-video"></i> Vidéo</span>
                    <video src="${s.src}" poster="${s.poster || s.fallback}" muted preload="metadata"
                           onerror="this.poster='${s.fallback}'"></video>
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                    <div class="souvenir-overlay">
                        <h4>${s.title}</h4>
                        <p><i class="fas fa-calendar"></i> ${s.date}</p>
                    </div>
                </div>
            `;
        }
        return `
            <div class="souvenir-item" data-id="${s.id}" data-type="photo">
                <span class="souvenir-badge"><i class="fas fa-camera"></i> Photo</span>
                <img src="${s.src}" alt="${s.title}"
                     onerror="this.src='${s.fallback}'" />
                <div class="souvenir-overlay">
                    <h4>${s.title}</h4>
                    <p><i class="fas fa-calendar"></i> ${s.date}</p>
                </div>
            </div>
        `;
    }).join('');

    gallery.querySelectorAll('.souvenir-item').forEach(item => {
        item.addEventListener('click', () => openLightbox(parseInt(item.dataset.id)));
    });
}

function openLightbox(id) {
    const souvenir = souvenirsData.find(s => s.id === id);
    if (!souvenir) return;

    let lightbox = document.getElementById('souvenirLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'souvenirLightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <div class="lightbox-content"></div>
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    const content = lightbox.querySelector('.lightbox-content');
    if (souvenir.type === 'video') {
        content.innerHTML = `<video src="${souvenir.src}" controls autoplay
            onerror="this.outerHTML='<img src=\\'${souvenir.fallback}\\' />'"></video>`;
    } else {
        content.innerHTML = `<img src="${souvenir.src}" alt="${souvenir.title}"
            onerror="this.src='${souvenir.fallback}'" />`;
    }

    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('souvenirLightbox');
    if (!lightbox) return;
    lightbox.classList.remove('active');
    const video = lightbox.querySelector('video');
    if (video) video.pause();
}

function initSouvenirs() {
    renderSouvenirs('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSouvenirs(btn.dataset.filter);
        });
    });
}

function initHeroCarousel() {
    const slides = document.querySelectorAll('#heroCarousel .carousel-slide');
    const dotsContainer = document.getElementById('heroDots');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    if (!slides.length) return;

    let current = 0;
    let interval;

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goTo(index) {
        slides[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');

        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetInterval(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetInterval(); });

    function startInterval() { interval = setInterval(next, 5000); }
    function resetInterval() { clearInterval(interval); startInterval(); }

    slides[0].classList.add('active');
    startInterval();
}

document.addEventListener('DOMContentLoaded', () => {
    initSouvenirs();
    initHeroCarousel();
});