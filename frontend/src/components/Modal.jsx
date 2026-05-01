/**
 * components/Modal.jsx — Modal générique réutilisable
 * ===============================================================
 * Composant modal Bootstrap générique qui peut être utilisé
 * dans toutes les pages pour créer, éditer ou confirmer.
 *
 * Props :
 *   - show        : boolean — afficher ou masquer
 *   - onClose     : Function — callback à la fermeture
 *   - title       : string — titre du modal
 *   - size        : 'sm' | 'md' | 'lg' | 'xl' (défaut: 'md')
 *   - children    : contenu du modal
 *   - footer      : JSX — pied de modal personnalisé (optionnel)
 *   - onConfirm   : Function — si fourni, affiche un bouton "Confirmer"
 *   - confirmLabel: string — texte du bouton confirmer (défaut: 'Confirmer')
 *   - confirmClass: string — classe Bootstrap du bouton (défaut: 'btn-primary')
 *
 * Usage :
 *   <Modal show={open} onClose={() => setOpen(false)} title="Nouvelle classe">
 *     <MonFormulaire />
 *   </Modal>
 * ===============================================================
 */

export default function Modal({
  show,
  onClose,
  title       = '',
  size        = 'md',
  children,
  footer,
  onConfirm,
  confirmLabel = 'Confirmer',
  confirmClass = 'btn-primary',
}) {
  // Ne rien rendre si le modal est fermé
  if (!show) return null;

  // Taille du dialog Bootstrap
  const sizeClass = size === 'md' ? '' : `modal-${size}`;

  return (
    // Fond semi-transparent
    <div
      className="modal show d-block"
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={(e) => {
        // Fermer si clic sur le fond (pas sur le contenu)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-dialog ${sizeClass} modal-dialog-centered modal-dialog-scrollable`}>
        <div className="modal-content border-0 shadow-lg">

          {/* ─── En-tête ──────────────────────────────────────── */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Fermer"
            />
          </div>

          {/* ─── Corps ────────────────────────────────────────── */}
          <div className="modal-body">
            {children}
          </div>

          {/* ─── Pied ─────────────────────────────────────────── */}
          <div className="modal-footer border-top">
            {footer ? (
              // Pied personnalisé fourni par le parent
              footer
            ) : (
              // Pied par défaut avec bouton Annuler + Confirmer
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Annuler
                </button>
                {onConfirm && (
                  <button
                    type="button"
                    className={`btn ${confirmClass}`}
                    onClick={onConfirm}
                  >
                    {confirmLabel}
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}