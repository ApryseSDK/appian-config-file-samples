/**
 * This script will log the following events to the console.
 */

window.addEventListener('newAppianValues', function(event) {
  console.log('New Appian Values', event.detail.newValues);
});

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  console.log('Viewer Loaded');
  const { documentViewer } = instance.Core;
  documentViewer.addEventListener('documentLoaded', () => {
    console.log('Document Loaded');
  });
});
