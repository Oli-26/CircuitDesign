// Circuit Designer - Standalone Entry Point
// Initializes the chip designer modal as a full-page application

document.addEventListener('DOMContentLoaded', () => {
    // Create the designer modal
    const modal = new ChipDesignerModal();
    window.chipDesignerModal = modal;

    // Show it immediately
    modal.show();

    // Override hide so user can't accidentally close it
    modal.hide = () => {
        // no-op in standalone mode
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        if (modal.designer) {
            const canvas = modal.designer.canvas;
            if (canvas) {
                modal.designer.resize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
            }
        }
    });

    console.log('Circuit Designer loaded successfully');
});
