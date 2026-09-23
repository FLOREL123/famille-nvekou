// Gestion de l'administration
class Admin {
    constructor() {
        this.isAdmin = false;
        this.currentEventId = null;
        this.adminPassword = 'admin123';
        this.init();
    }

    init() {
        document.getElementById('adminAccessBtn').addEventListener('click', () => {
            this.openAdminLogin();
        });

        document.getElementById('closeAdminLogin').addEventListener('click', () => {
            this.closeModal('adminLoginModal');
        });

        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });

        document.getElementById('adminExitBtn').addEventListener('click', () => {
            this.exitAdmin();
        });

        document.getElementById('addEventBtn')?.addEventListener('click', () => this.openAddEventModal());
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.openAddMemberModal());
        document.getElementById('closeEventModal')?.addEventListener('click', () => this.closeModal('addEventModal'));
        document.getElementById('closePaymentModal')?.addEventListener('click', () => this.closeModal('paymentModal'));
        document.getElementById('closeAddMemberModal')?.addEventListener('click', () => this.closeModal('addMemberModal'));
        document.getElementById('closeDeathModal')?.addEventListener('click', () => this.closeModal('declarDeathModal'));
        document.getElementById('cancelDeathBtn')?.addEventListener('click', () => this.closeModal('declarDeathModal'));

        document.getElementById('addEventForm')?.addEventListener('submit', (e) => this.handleAddEvent(e));
        document.getElementById('addMemberForm')?.addEventListener('submit', (e) => this.handleAddMember(e));
        document.getElementById('confirmDeathBtn')?.addEventListener('click', () => this.confirmDeath());

        document.addEventListener('click', (e) => {
            if (e.target.closest('.admin-event-item')) {
                const item = e.target.closest('.admin-event-item');
                const eventId = item.dataset.eventId;
                if (e.target.closest('.btn-payment')) {
                    this.openPaymentModal(eventId);
                } else if (e.target.closest('.btn-delete')) {
                    this.deleteEvent(eventId);
                }
            }

            if (e.target.closest('.btn-delete-member')) {
                const memberId = e.target.dataset.memberId;
                this.deleteMember(memberId);
            }

            if (e.target.closest('.btn-death')) {
                const memberId = e.target.dataset.memberId;
                const memberName = e.target.dataset.memberName;
                this.openDeathModal(memberId, memberName);
            }

            if (e.target.closest('.btn-edit-member')) {
                const memberId = e.target.dataset.memberId;
                this.editMember(memberId);
            }

            if (e.target.closest('.btn-toggle-payment')) {
                const btn = e.target.closest('.btn-toggle-payment');
                const memberId = btn.dataset.memberId;
                const eventId = btn.dataset.eventId;
                this.togglePayment(eventId, memberId);
            }

            if (e.target.closest('.btn-donation')) {
                const btn = e.target.closest('.btn-donation');
                const memberId = btn.dataset.memberId;
                const eventId = btn.dataset.eventId;
                this.toggleDonation(eventId, memberId);
            }
        });

        document.getElementById('uploadPhotoBtn')?.addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });

        document.getElementById('photoUpload')?.addEventListener('change', (e) => {
            this.uploadPhoto(e.target.files[0]);
        });
    }

    openAdminLogin() {
        document.getElementById('adminLoginModal').classList.add('show');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }

    handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;
        if (password === this.adminPassword) {
            this.isAdmin = true;
            this.closeModal('adminLoginModal');
            this.showAdminPage();
            this.loadAdminData();
            auth.showToast('Accès administrateur accordé', 'success');
        } else {
            auth.showToast('Mot de passe incorrect', 'error');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    showAdminPage() {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-admin').classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    }

    exitAdmin() {
        this.isAdmin = false;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-accueil').classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-links a[data-page="accueil"]').classList.add('active');
        auth.showToast('Déconnexion admin réussie', 'success');
        auth.openModal('login');
    }

    async loadAdminData() {
        if (!this.isAdmin) return;
        try {
            await this.loadStats();
            await this.loadAdminEvents();
            await this.loadAdminMembers();
        } catch (error) {
            console.error('Erreur chargement données admin:', error);
            auth.showToast('Erreur de chargement des données', 'error');
        }
    }

    async loadStats() {
        try {
            const stats = {
                totalMembers: 45,
                totalEvents: 12,
                totalPositions: 8,
                totalDons: 250000
            };

            document.getElementById('totalMembers').textContent = stats.totalMembers;
            document.getElementById('totalEvents').textContent = stats.totalEvents;
            document.getElementById('totalPositions').textContent = stats.totalPositions;
            document.getElementById('totalDons').textContent = stats.totalDons + ' FCFA';
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }

    async loadAdminEvents() {
        try {
            const events = [
                { id: 1, title: 'Cérémonie Traditionnelle', date: '2024-01-15', location: 'Lomé', amount: 10000 },
                { id: 2, title: 'Réunion de Famille', date: '2024-02-20', location: 'Aného', amount: 5000 }
            ];

            const container = document.getElementById('adminEventsList');
            container.innerHTML = events.map(event => `
                <div class="admin-event-item" data-event-id="${event.id}">
                    <div class="event-info">
                        <div class="event-title">${event.title}</div>
                        <div class="event-meta">
                            ${new Date(event.date).toLocaleDateString('fr-FR')} - ${event.location || 'Lieu non spécifié'}
                            ${event.amount ? `- ${event.amount} FCFA` : ''}
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn-small btn-payment" data-event-id="${event.id}">
                            <i class="fas fa-coins"></i> Paiements
                        </button>
                        <button class="btn-small btn-delete" data-event-id="${event.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement événements admin:', error);
        }
    }

    async loadAdminMembers() {
        try {
            const members = [
                { id: 1, firstName: 'Koffi', familyName: 'N\'VEKOUNOU', position: 'Dah', phone: '+228 90000000', photo: 'https://via.placeholder.com/40x40/8B0000/FFFFFF?text=K' },
                { id: 2, firstName: 'Ama', familyName: 'N\'VEKOUNOU', position: 'Membre', phone: '+228 90000001', photo: 'https://via.placeholder.com/40x40/5C0000/FFFFFF?text=A' }
            ];

            const tbody = document.getElementById('adminMembersTable');
            tbody.innerHTML = members.map(member => `
                <tr>
                    <td><img src="${member.photo}" alt="${member.firstName}" class="member-avatar" /></td>
                    <td>${member.familyName}</td>
                    <td>${member.firstName}</td>
                    <td>${member.position}</td>
                    <td>${member.phone}</td>
                    <td class="actions">
                        <button class="btn-small btn-edit-member" data-member-id="${member.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-small btn-delete-member" data-member-id="${member.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-small btn-death" data-member-id="${member.id}" data-member-name="${member.firstName} ${member.familyName}">
                            <i class="fas fa-skull"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erreur chargement membres admin:', error);
        }
    }

    openAddEventModal() {
        document.getElementById('addEventModal').classList.add('show');
        document.getElementById('addEventForm').reset();
    }

    async handleAddEvent(e) {
        e.preventDefault();
        const eventData = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            amount: parseInt(document.getElementById('eventAmount').value) || 0
        };

        try {
            auth.showToast('Événement créé avec succès!', 'success');
            this.closeModal('addEventModal');
            document.getElementById('addEventForm').reset();
            await this.loadAdminEvents();
            await this.loadStats();
        } catch (error) {
            console.error('Erreur ajout événement:', error);
            auth.showToast('Erreur lors de la création', 'error');
        }
    }

    openPaymentModal(eventId) {
        this.currentEventId = eventId;
        const payments = [
            { memberId: 1, name: 'Koffi N\'VEKOUNOU', paid: true, donation: false },
            { memberId: 2, name: 'Ama N\'VEKOUNOU', paid: false, donation: true }
        ];

        const container = document.getElementById('paymentList');
        container.innerHTML = payments.map(p => `
            <div class="payment-item">
                <span class="member-name">${p.name}</span>
                <div class="payment-status">
                    <span class="badge ${p.paid ? 'badge-paid' : 'badge-unpaid'}">
                        ${p.paid ? 'Payé' : 'Non payé'}
                    </span>
                    ${p.donation ? '<span class="badge" style="background:#f39c12;color:white;">Don</span>' : ''}
                    <button class="btn-toggle-payment ${p.paid ? 'mark-unpaid' : 'mark-paid'}" 
                            data-member-id="${p.memberId}" 
                            data-event-id="${eventId}">
                        ${p.paid ? 'Marquer non payé' : 'Marquer payé'}
                    </button>
                    <button class="btn-donation" data-member-id="${p.memberId}" data-event-id="${eventId}">
                        ${p.donation ? 'Retirer don' : 'Ajouter don'}
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('paymentModalTitle').textContent = `Paiements - Événement #${eventId}`;
        document.getElementById('paymentModal').classList.add('show');
    }

    async togglePayment(eventId, memberId) {
        try {
            auth.showToast('Statut de paiement mis à jour', 'success');
            this.openPaymentModal(eventId);
        } catch (error) {
            console.error('Erreur toggle paiement:', error);
            auth.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    async toggleDonation(eventId, memberId) {
        try {
            auth.showToast('Don mis à jour', 'success');
            this.openPaymentModal(eventId);
        } catch (error) {
            console.error('Erreur toggle don:', error);
            auth.showToast('Erreur lors de la mise à jour', 'error');
        }
    }

    async deleteEvent(eventId) {
        if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
        try {
            auth.showToast('Événement supprimé', 'success');
            await this.loadAdminEvents();
            await this.loadStats();
        } catch (error) {
            console.error('Erreur suppression événement:', error);
            auth.showToast('Erreur lors de la suppression', 'error');
        }
    }

    openAddMemberModal() {
        document.getElementById('addMemberModal').classList.add('show');
        document.getElementById('addMemberForm').reset();
    }

    async handleAddMember(e) {
        e.preventDefault();
        const memberData = {
            firstName: document.getElementById('addMemberFirstName').value,
            father: document.getElementById('addMemberFather').value,
            mother: document.getElementById('addMemberMother').value,
            birthdate: document.getElementById('addMemberBirthdate').value,
            location: document.getElementById('addMemberLocation').value,
            phone: document.getElementById('addMemberPhone').value,
            position: document.getElementById('addMemberPosition').value,
            email: document.getElementById('addMemberEmail').value,
            password: document.getElementById('addMemberPassword').value || Math.random().toString(36).slice(-8)
        };

        try {
            auth.showToast('Membre ajouté avec succès!', 'success');
            this.closeModal('addMemberModal');
            document.getElementById('addMemberForm').reset();
            await this.loadAdminMembers();
            await this.loadStats();
        } catch (error) {
            console.error('Erreur ajout membre:', error);
            auth.showToast('Erreur lors de l\'ajout', 'error');
        }
    }

    async deleteMember(memberId) {
        if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;
        try {
            auth.showToast('Membre supprimé', 'success');
            await this.loadAdminMembers();
            await this.loadStats();
        } catch (error) {
            console.error('Erreur suppression membre:', error);
            auth.showToast('Erreur lors de la suppression', 'error');
        }
    }

    openDeathModal(memberId, memberName) {
        document.getElementById('deathMemberName').textContent = memberName;
        document.getElementById('declarDeathModal').dataset.memberId = memberId;
        document.getElementById('declarDeathModal').classList.add('show');
    }

    async confirmDeath() {
        const memberId = document.getElementById('declarDeathModal').dataset.memberId;
        if (!confirm('Confirmer le décès de ce membre ?')) return;
        try {
            auth.showToast('Décès déclaré avec succès', 'success');
            this.closeModal('declarDeathModal');
            await this.loadAdminMembers();
            await this.loadStats();
        } catch (error) {
            console.error('Erreur déclaration décès:', error);
            auth.showToast('Erreur lors de la déclaration', 'error');
        }
    }

    async editMember(memberId) {
        auth.showToast('Fonctionnalité d\'édition à implémenter', 'info');
    }

    async uploadPhoto(file) {
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('userAvatar').src = e.target.result;
                auth.showToast('Photo mise à jour!', 'success');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Erreur upload photo:', error);
            auth.showToast('Erreur lors de l\'upload', 'error');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const admin = new Admin();
    window.admin = admin;
});