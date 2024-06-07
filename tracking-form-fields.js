/**
 * This script is used to track whether required fields have been filled in the WebViewer.
 */
let latestAppianValues;

// Listen for new values from Appian
window.addEventListener('newAppianValues', function (event) {
  if (event.detail.newValues) {
    latestAppianValues = event.detail.newValues;
  }
});

// Tracking whether fields have been filled
let areRequiredFieldsFilled = true;

// Listen for the WebViewer instance is mounted and ready
instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  const { documentViewer, annotationManager } = instance.Core;

  // Check if fields have been filled on document loaded
  documentViewer.addEventListener('documentLoaded', () => {
    areRequiredFieldsFilled = annotationManager.getFieldManager().areRequiredFieldsFilled();
  });

  // Listen for changes to annotations
  annotationManager.addEventListener('annotationChanged', (_annotations, _action, info) => {
    const fieldManager = annotationManager.getFieldManager();
    // Signatures will not trigger fieldChanged, so we should also update here too
    areRequiredFieldsFilled = fieldManager.areRequiredFieldsFilled();
  });

  // Listen for changes to the value of fields
  annotationManager.addEventListener('fieldChanged', () => {
    const fieldManager = annotationManager.getFieldManager();
    areRequiredFieldsFilled = fieldManager.areRequiredFieldsFilled();
  });
});
