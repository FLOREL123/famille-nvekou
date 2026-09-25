// ============================================
// GESTION DE L'ADMINISTRATION
// ============================================

class Admin {
    constructor() {
        this.isAdmin = false;
        this.currentEventId = null;
        this.currentPaymentMemberId = null;
        this.adminPassword = 'admin123';

        this.members = [
            {
                id: 1, firstName: 'Koffi', familyName: "N'VEKOUNOU",
                father: 'Tété', mother: 'Ama', birthdate: '1990-01-15', age: 34,
                job: 'Enseignant', location: 'Lomé', phone: '+228 90000000',
                email: 'koffi@nvekou.com', position: 'dah', intronisation: '2020-06-15',
                children: ['Kodjo', 'Akpene'], spouse: 'Yawa',
                photo: 'https://via.placeholder.com/80x80/8B0000/FFFFFF?text=K',
                status: 'vivant'
            },
            {
                id: 2, firstName: 'Ama', familyName: "N'VEKOUNOU",
                father: 'Tété', mother: 'Ama', birthdate: '1985-05-20', age: 39,
                job: 'Médecin', location: 'Aného', phone: '+228 90000001',
                email: 'ama@nvekou.com', position: 'membre', intronisation: null,
                children: [], spouse: '',
                photo: 'https://via.placeholder.com/80x80/5C0000/FFFFFF?text=A',
                status: 'vivant'
            },
            {
                id: 3, firstName: 'Tété', familyName: "N'VEKOUNOU",
                father: 'Kossi', mother: 'Adjo', birthdate: '1960-03-10', age: 64,
                job: 'Ingénieur', location: 'Lomé', phone: '+228 90000002',
                email: 'tete@nvekou.com', position: 'vigan', intronisation: '2015-08-20',
                children: ['Koffi', 'Ama'], spouse: 'Afiavi',
                photo: 'https://via.placeholder.com/80x80/8B0000/FFFFFF?text=T',
                status: 'vivant'
            }
        ];

        this.events = [
            {
                id: 1, title: 'Cérémonie Traditionnelle', date: '2024-01-15',
                location: 'Lomé', description: 'Cérémonie annuelle', amount: 10000,
                payments: { 1: { paid: true, donation: null }, 2: { paid: false, donation: null } }
            },
            {
                id: 2, title: 'Réunion de Famille', date: '2024-02-20',
                location: 'Aného', description: 'Réunion', amount: 5000,
                payments: {}
            }
        ];

        this.init();
    }

    init() {
        document.getElementById('adminAccessBtn')?.addEventListener('click', () => this.openAdminLogin());

        document.getElementById('closeAdminLogin')?.addEventListener('click', () => this.closeModal('adminLoginModal'));
        document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });

        document.getElementById('adminExitBtn')?.addEventListener('click', () => this.exitAdmin());

        document.getElementById('addEventBtn')?.addEventListener('click', () => this.openAddEventModal());
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this.openAddMemberModal());

        document.getElementById('closeEventModal')?.addEventListener('click', () => this.closeModal('addEventModal'));
        document.getElementById('closePaymentModal')?.addEventListener('click', () => this.closeModal('paymentModal'));
        document.getElementById('closeAddMemberModal')?.addEventListener('click', () => this.closeModal('addMemberModal'));
        document.getElementById('closeDeathModal')?.addEventListener('click', () => this.closeModal('declarDeathModal'));
        document.getElementById('cancelDeathBtn')?.addEventListener('click', () => this.closeModal('declarDeathModal'));
        document.getElementById('closeDonationModal')?.addEventListener('click', () => this.closeModal('donationModal'));
        document.getElementById('closeDonationView')?.addEventListener('click', () => this.closeModal('donationViewModal'));
        document.getElementById('closeEditMemberModal')?.addEventListener('click', () => this.closeModal('editMemberModal'));

        document.getElementById('addEventForm')?.addEventListener('submit', (e) => this.handleAddEvent(e));
        document.getElementById('addMemberForm')?.addEventListener('submit', (e) => this.handleAddMember(e));
        document.getElementById('confirmDeathBtn')?.addEventListener('click', () => this.confirmDeath());
        document.getElementById('donationForm')?.addEventListener('submit', (e) => this.handleDonation(e));
        document.getElementById('editMemberForm')?.addEventListener('submit', (e) => this.handleEditMember(e));

        document.addEventListener('click', (e) => this.handleDelegatedClick(e));
    }

    handleDelegatedClick(e) {
        const adminEventItem = e.target.closest('.admin-event-item');
        if (adminEventItem) {
            const eventId = adminEventItem.dataset.eventId;
            if (e.target.closest('.btn-payment') || e.target.closest('.event-info')) {
                this.openPaymentModal(eventId);
            } else if (e.target.closest('.btn-delete')) {
                this.deleteEvent(eventId);
            }
            return;
        }

        const payBtn = e.target.closest('.btn-toggle-payment');
        if (payBtn) {
            this.togglePayment(payBtn.dataset.eventId, payBtn.dataset.memberId);
            return;
        }

        const donBtn = e.target.closest('.btn-donation');
        if (donBtn) {
            this.openDonationModal(donBtn.dataset.eventId, donBtn.dataset.memberId);
            return;
        }

        const viewDonBtn = e.target.closest('.btn-view-donation');
        if (viewDonBtn) {
            this.viewDonation(viewDonBtn.dataset.eventId, viewDonBtn.dataset.memberId);
            return;
        }

        const editMemberBtn = e.target.closest('.btn-edit-member');
        if (editMemberBtn) {
            this.openEditMemberModal(editMemberBtn.dataset.memberId);
            return;
        }

        const delMemberBtn = e.target.closest('.btn-delete-member');
        if (delMemberBtn) {
            this.deleteMember(delMemberBtn.dataset.memberId);
            return;
        }

        const deathBtn = e.target.closest('.btn-death');
        if (deathBtn) {
            this.openDeathModal(deathBtn.dataset.memberId, deathBtn.dataset.memberName);
            return;
        }
    }

    // ---------- AUTHENTIFICATION ADMIN ----------
    openAdminLogin() {
        document.getElementById('adminLoginModal').classList.add('show');
        document.getElementById('adminPassword').value = '';
        setTimeout(() => document.getElementById('adminPassword').focus(), 100);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    exitAdmin() {
        if (!confirm('Voulez-vous vraiment vous déconnecter du panel admin ?')) return;
        this.isAdmin = false;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-accueil').classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-links a[data-page="accueil"]')?.classList.add('active');
        auth.showToast('Vous avez quitté le panel admin', 'info');
    }

    // ---------- CHARGEMENT DES DONNÉES ----------
    async loadAdminData() {
        if (!this.isAdmin) return;
        await this.loadStats();
        await this.loadAdminEvents();
        await this.loadAdminMembers();
    }

    async loadStats() {
        const livingMembers = this.members.filter(m => m.status !== 'decede');
        const occupiedPositions = this.members.filter(m => m.position !== 'membre' && m.status !== 'decede');

        let totalDons = 0;
        this.events.forEach(ev => {
            Object.values(ev.payments || {}).forEach(p => {
                if (p.donation && p.donation.amount) totalDons += p.donation.amount;
            });
        });

        document.getElementById('totalMembers').textContent = livingMembers.length;
        document.getElementById('totalEvents').textContent = this.events.length;
        document.getElementById('totalPositions').textContent = occupiedPositions.length;
        document.getElementById('totalDons').textContent = totalDons.toLocaleString('fr-FR') + ' FCFA';
    }

    async loadAdminEvents() {
        const container = document.getElementById('adminEventsList');
        if (!container) return;

        if (this.events.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">Aucun événement pour le moment.</p>';
            return;
        }

        container.innerHTML = this.events.map(event => {
            const payments = event.payments || {};
            const paidCount = Object.values(payments).filter(p => p.paid).length;
            const totalMembers = this.members.filter(m => m.status !== 'decede').length;

            return `
                <div class="admin-event-item" data-event-id="${event.id}">
                    <div class="event-info">
                        <div class="event-title">${this.escape(event.title)}</div>
                        <div class="event-meta">
                            <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString('fr-FR')}
                            ${event.location ? ` · <i class="fas fa-map-marker-alt"></i> ${this.escape(event.location)}` : ''}
                            ${event.amount ? ` · <i class="fas fa-coins"></i> ${event.amount.toLocaleString('fr-FR')} FCFA` : ''}
                        </div>
                        <div class="event-meta" style="margin-top:6px;color:var(--primary);font-weight:500;">
                            <i class="fas fa-check-circle"></i> ${paidCount}/${totalMembers} ont payé
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn-small btn-payment" data-event-id="${event.id}">
                            <i class="fas fa-coins"></i> Voir les paiements
                        </button>
                        <button class="btn-small btn-delete" data-event-id="${event.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadAdminMembers() {
        const tbody = document.getElementById('adminMembersTable');
        if (!tbody) return;

        if (this.members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:2rem;">Aucun membre</td></tr>';
            return;
        }

        tbody.innerHTML = this.members.map(member => `
            <tr class="${member.status === 'decede' ? 'row-deceased' : ''}">
                <td><img src="${member.photo}" alt="${member.firstName}" class="member-avatar" /></td>
                <td>${this.escape(member.familyName)} ${member.status === 'decede' ? '<span class="badge-deceased">† Décédé</span>' : ''}</td>
                <td>${this.escape(member.firstName)}</td>
                <td>${this.getPositionLabel(member.position)}</td>
                <td>${this.escape(member.phone || '--')}</td>
                <td class="actions">
                    <button class="btn-small btn-edit-member" data-member-id="${member.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-delete-member" data-member-id="${member.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${member.status !== 'decede' ? `
                        <button class="btn-small btn-death" data-member-id="${member.id}" data-member-name="${member.firstName} ${member.familyName}" title="Déclarer décès">
                            <i class="fas fa-skull"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    // ---------- GESTION DES ÉVÉNEMENTS ----------
    openAddEventModal() {
        document.getElementById('addEventModal').classList.add('show');
        document.getElementById('addEventForm').reset();
    }

    async handleAddEvent(e) {
        e.preventDefault();
        const newEvent = {
            id: Date.now(),
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            amount: parseInt(document.getElementById('eventAmount').value) || 0,
            payments: {}
        };

        this.events.push(newEvent);
        this.closeModal('addEventModal');
        document.getElementById('addEventForm').reset();
        await this.loadAdminEvents();
        await this.loadStats();
        auth.showToast('Événement créé avec succès!', 'success');
    }

    async deleteEvent(eventId) {
        if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
        this.events = this.events.filter(ev => String(ev.id) !== String(eventId));
        await this.loadAdminEvents();
        await this.loadStats();
        auth.showToast('Événement supprimé', 'success');
    }

    // ---------- GESTION DES PAIEMENTS ----------
    openPaymentModal(eventId) {
        this.currentEventId = eventId;
        const event = this.events.find(ev => String(ev.id) === String(eventId));
        if (!event) return;

        event.payments = event.payments || {};

        const paidCount = Object.values(event.payments).filter(p => p.paid).length;
        const donationCount = Object.values(event.payments).filter(p => p.donation).length;
        let totalPaid = 0;
        let totalDonations = 0;

        Object.values(event.payments).forEach(p => {
            if (p.paid && event.amount) totalPaid += event.amount;
            if (p.donation && p.donation.amount) totalDonations += p.donation.amount;
        });

        document.getElementById('paymentSummary').innerHTML = `
            <div class="summary-item">
                <span class="summary-value">${paidCount}/${this.members.filter(m => m.status !== 'decede').length}</span>
                <span class="summary-label">Ont payé</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${totalPaid.toLocaleString('fr-FR')}</span>
                <span class="summary-label">FCFA collectés</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${donationCount}</span>
                <span class="summary-label">Dons</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${totalDonations.toLocaleString('fr-FR')}</span>
                <span class="summary-label">FCFA de dons</span>
            </div>
        `;

        const container = document.getElementById('paymentList');
        container.innerHTML = this.members.map(member => {
            const payment = event.payments[member.id] || { paid: false, donation: null };
            const isDeceased = member.status === 'decede';

            return `
                <div class="payment-item">
                    <div class="member-info">
                        <img src="${member.photo}" alt="${member.firstName}" />
                        <div>
                            <span class="member-name">
                                ${this.escape(member.firstName)} ${this.escape(member.familyName)}
                                ${isDeceased ? '<span class="badge-deceased">†</span>' : ''}
                            </span>
                            <span class="member-phone">${this.escape(member.phone || '')}</span>
                        </div>
                    </div>
                    <div class="payment-status">
                        <span class="badge ${payment.paid ? 'badge-paid' : 'badge-unpaid'}">
                            ${payment.paid ? '✓ Payé' : '✗ Non payé'}
                        </span>
                        ${payment.donation ? `
                            <button class="btn-view-donation" 
                                    data-event-id="${eventId}" 
                                    data-member-id="${member.id}">
                                <i class="fas fa-gift"></i> Voir le don
                            </button>
                        ` : ''}
                        <button class="btn-toggle-payment ${payment.paid ? 'mark-unpaid' : 'mark-paid'}"
                                data-member-id="${member.id}"
                                data-event-id="${eventId}">
                            ${payment.paid ? 'Marquer non payé' : 'Marquer payé'}
                        </button>
                        <button class="btn-donation" 
                                data-member-id="${member.id}"
                                data-event-id="${eventId}">
                            ${payment.donation ? 'Modifier le don' : 'Ajouter un don'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('paymentModalTitle').innerHTML = 
            `<i class="fas fa-coins"></i> ${this.escape(event.title)}`;
        document.getElementById('paymentModal').classList.add('show');
    }

    async togglePayment(eventId, memberId) {
        const event = this.events.find(ev => String(ev.id) === String(eventId));
        if (!event) return;
        event.payments = event.payments || {};
        event.payments[memberId] = event.payments[memberId] || { paid: false, donation: null };
        event.payments[memberId].paid = !event.payments[memberId].paid;

        const member = this.members.find(m => String(m.id) === String(memberId));
        auth.showToast(
            `${member.firstName} : ${event.payments[memberId].paid ? 'payé' : 'non payé'}`,
            'success'
        );

        this.openPaymentModal(eventId);
        await this.loadAdminEvents();
    }

    // ---------- GESTION DES DONS ----------
    openDonationModal(eventId, memberId) {
        this.currentEventId = eventId;
        this.currentPaymentMemberId = memberId;

        const event = this.events.find(ev => String(ev.id) === String(eventId));
        const member = this.members.find(m => String(m.id) === String(memberId));
        const existing = event?.payments?.[memberId]?.donation;

        document.getElementById('donationModalTitle').textContent = 
            `Don de ${member?.firstName || ''} ${member?.familyName || ''}`;
        document.getElementById('donationDescription').value = existing?.description || '';
        document.getElementById('donationAmount').value = existing?.amount || '';
        document.getElementById('donationModal').classList.add('show');
    }

    async handleDonation(e) {
        e.preventDefault();
        const event = this.events.find(ev => String(ev.id) === String(this.currentEventId));
        if (!event) return;

        event.payments = event.payments || {};
        event.payments[this.currentPaymentMemberId] = event.payments[this.currentPaymentMemberId] || { paid: false, donation: null };

        event.payments[this.currentPaymentMemberId].donation = {
            description: document.getElementById('donationDescription').value,
            amount: parseInt(document.getElementById('donationAmount').value) || 0,
            date: new Date().toISOString()
        };

        this.closeModal('donationModal');
        document.getElementById('donationForm').reset();
        this.openPaymentModal(this.currentEventId);
        await this.loadStats();
        auth.showToast('Don enregistré avec succès!', 'success');
    }

    viewDonation(eventId, memberId) {
        const event = this.events.find(ev => String(ev.id) === String(eventId));
        const member = this.members.find(m => String(m.id) === String(memberId));
        const donation = event?.payments?.[memberId]?.donation;

        if (!donation) return;

        document.getElementById('donationViewContent').innerHTML = `
            <p style="text-align:center;color:#666;margin-bottom:1rem;">
                <strong>${this.escape(member.firstName)} ${this.escape(member.familyName)}</strong>
            </p>
            <div class="donation-desc">
                <i class="fas fa-quote-left" style="color:var(--gold);"></i>
                ${this.escape(donation.description)}
            </div>
            ${donation.amount ? `
                <div class="donation-amount">
                    <i class="fas fa-coins"></i> ${donation.amount.toLocaleString('fr-FR')} FCFA
                </div>
            ` : ''}
            <div class="donation-date">
                <i class="fas fa-calendar"></i> ${new Date(donation.date).toLocaleDateString('fr-FR')}
            </div>
        `;
        document.getElementById('donationViewModal').classList.add('show');
    }

    // ---------- GESTION DES MEMBRES ----------
    openAddMemberModal() {
        document.getElementById('addMemberModal').classList.add('show');
        document.getElementById('addMemberForm').reset();
    }

    async handleAddMember(e) {
        e.preventDefault();
        const firstName = document.getElementById('addMemberFirstName').value;
        const birthdate = document.getElementById('addMemberBirthdate').value;

        const newMember = {
            id: Date.now(),
            firstName: firstName,
            familyName: "N'VEKOUNOU",
            father: document.getElementById('addMemberFather').value,
            mother: document.getElementById('addMemberMother').value,
            birthdate: birthdate,
            age: birthdate ? new Date().getFullYear() - new Date(birthdate).getFullYear() : 0,
            job: '',
            location: document.getElementById('addMemberLocation').value,
            phone: document.getElementById('addMemberPhone').value,
            email: document.getElementById('addMemberEmail').value,
            position: document.getElementById('addMemberPosition').value,
            intronisation: null,
            children: [],
            spouse: '',
            photo: 'https://via.placeholder.com/80x80/8B0000/FFFFFF?text=' + firstName.charAt(0).toUpperCase(),
            status: 'vivant'
        };

        this.members.push(newMember);
        this.closeModal('addMemberModal');
        document.getElementById('addMemberForm').reset();
        await this.loadAdminMembers();
        await this.loadStats();
        auth.showToast('Membre ajouté avec succès!', 'success');
    }

    openEditMemberModal(memberId) {
        const member = this.members.find(m => String(m.id) === String(memberId));
        if (!member) return;

        document.getElementById('editMemberId').value = member.id;
        document.getElementById('editMemberFirstName').value = member.firstName || '';
        document.getElementById('editMemberFamilyName').value = member.familyName || "N'VEKOUNOU";
        document.getElementById('editMemberFather').value = member.father || '';
        document.getElementById('editMemberMother').value = member.mother || '';
        document.getElementById('editMemberBirthdate').value = member.birthdate || '';
        document.getElementById('editMemberAge').value = member.age || '';
        document.getElementById('editMemberJob').value = member.job || '';
        document.getElementById('editMemberLocation').value = member.location || '';
        document.getElementById('editMemberPhone').value = member.phone || '';
        document.getElementById('editMemberEmail').value = member.email || '';
        document.getElementById('editMemberChildren').value = (member.children || []).join(', ');
        document.getElementById('editMemberSpouse').value = member.spouse || '';
        document.getElementById('editMemberPosition').value = member.position || 'membre';
        document.getElementById('editMemberIntronisation').value = member.intronisation || '';
        document.getElementById('editMemberStatus').value = member.status || 'vivant';

        const preview = document.getElementById('editMemberPhotoPreview');
        if (member.photo) {
            preview.src = member.photo;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }

        document.getElementById('editMemberModal').classList.add('show');
    }

    async handleEditMember(e) {
        e.preventDefault();
        const memberId = document.getElementById('editMemberId').value;
        const member = this.members.find(m => String(m.id) === String(memberId));
        if (!member) return;

        member.firstName = document.getElementById('editMemberFirstName').value;
        member.father = document.getElementById('editMemberFather').value;
        member.mother = document.getElementById('editMemberMother').value;
        member.birthdate = document.getElementById('editMemberBirthdate').value;
        member.age = parseInt(document.getElementById('editMemberAge').value) || member.age;
        member.job = document.getElementById('editMemberJob').value;
        member.location = document.getElementById('editMemberLocation').value;
        member.phone = document.getElementById('editMemberPhone').value;
        member.email = document.getElementById('editMemberEmail').value;
        member.children = document.getElementById('editMemberChildren').value.split(',').map(c => c.trim()).filter(Boolean);
        member.spouse = document.getElementById('editMemberSpouse').value;
        member.position = document.getElementById('editMemberPosition').value;
        member.intronisation = document.getElementById('editMemberIntronisation').value || null;
        member.status = document.getElementById('editMemberStatus').value;

        const photoFile = document.getElementById('editMemberPhoto').files[0];
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                member.photo = ev.target.result;
                this.loadAdminMembers();
            };
            reader.readAsDataURL(photoFile);
        }

        this.closeModal('editMemberModal');
        await this.loadAdminMembers();
        await this.loadStats();
        auth.showToast('Membre modifié avec succès!', 'success');
    }

    async deleteMember(memberId) {
        const member = this.members.find(m => String(m.id) === String(memberId));
        if (!member) return;
        if (!confirm(`Voulez-vous vraiment supprimer définitivement ${member.firstName} ${member.familyName} ?\n\n⚠️ Pour conserver la mémoire, préférez "Déclarer décès".`)) return;

        this.members = this.members.filter(m => String(m.id) !== String(memberId));
        await this.loadAdminMembers();
        await this.loadStats();
        auth.showToast('Membre supprimé', 'success');
    }

    // ---------- DÉCLARATION DE DÉCÈS ----------
    openDeathModal(memberId, memberName) {
        document.getElementById('deathMemberName').textContent = memberName;
        document.getElementById('declarDeathModal').dataset.memberId = memberId;
        document.getElementById('declarDeathModal').classList.add('show');
    }

    async confirmDeath() {
        const memberId = document.getElementById('declarDeathModal').dataset.memberId;
        const member = this.members.find(m => String(m.id) === String(memberId));
        if (!member) return;

        member.status = 'decede';
        if (member.position !== 'membre') {
            member.previousPosition = member.position;
            member.position = 'membre';
        }

        this.closeModal('declarDeathModal');
        await this.loadAdminMembers();
        await this.loadStats();
        auth.showToast(`${member.firstName} a été déclaré(e) décédé(e). Sa position est libérée.`, 'info');
    }

    // ---------- UTILITAIRES ----------
    getPositionLabel(position) {
        const labels = {
            'membre': 'Membre', 'dah': 'Dah', 'baba_kouboulo': 'Baba KOUBOULOU',
            'vigan': 'Vigan', 'saranon': 'Saranon', 'tangnis': 'Tangnis',
            'tangno': 'Tangno', 'otoun': 'Otoun', 'adjanan': 'ADJANAN'
        };
        return labels[position] || position;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    window.admin = new Admin();
});