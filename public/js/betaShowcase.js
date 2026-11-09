// public/js/betaShowcase.js - Beta v1.4 Büyük Güncelleme Tek Sayfa Tanıtım Vitrini Yöneticisi
(function () {
    function openBetaShowcaseModal() {
        const modal = document.getElementById('updatesModal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (typeof playSound === 'function') {
            try { playSound('pop'); } catch (e) { }
        }
    }

    function closeBetaShowcaseModal() {
        const modal = document.getElementById('updatesModal');
        if (modal) modal.style.display = 'none';
    }

    window.openBetaShowcaseModal = openBetaShowcaseModal;
    window.closeBetaShowcaseModal = closeBetaShowcaseModal;

    // Geriye dönük uyumluluk aliasları
    window.openUpdatesModal = openBetaShowcaseModal;
    window.closeUpdatesModal = closeBetaShowcaseModal;
    window.switchBetaTab = function () {}; // Tek sayfa özet vitrininde sekme gerekmediği için güvenli no-op
})();
