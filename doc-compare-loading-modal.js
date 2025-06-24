/**
 * This script demonstrates loading a modal when comparing two large documents
 */
instance.UI.addEventListener(instance.UI.Events.MULTI_VIEWER_READY, () => {
    const [documentViewer1, documentViewer2] = instance.Core.getDocumentViewers();
    const startCompare = async () => {
      const shouldCompare = documentViewer1.getDocument() && documentViewer2.getDocument();
      if (shouldCompare) {
        instance.UI.closeElements(['loadingModal']);
      }
    }
    documentViewer1.addEventListener('documentLoaded', startCompare);
    documentViewer2.addEventListener('documentLoaded', startCompare);
    instance.UI.openElements(['loadingModal']);
});