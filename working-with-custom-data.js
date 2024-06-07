/**
 * This script demonstrates how to work with custom data from the Appian component properties.
*/
let latestAppianValues;

// Listen for new values from Appian
window.addEventListener('newAppianValues', function (event) {
  if (event.detail.newValues) {
    latestAppianValues = event.detail.newValues;
  }
});

instance.UI.addEventListener(instance.UI.Events.DOCUMENT_LOADED, () => {
  const { annotationManager, Annotations } = instance.Core;
  const { customData } = latestAppianValues;

  // If the user provided a rect type, then we make a rectangle annotation at a specific location
  if (customData.type === "rect") {
    const rectangleAnnotation = new Annotations.RectangleAnnotation({
      PageNumber: 1,
      X: 100,
      Y: 100,
      Width: 250,
      Height: 250,
    });
    // Add and render the annotation
    annotationManager.addAnnotation(rectangleAnnotation);
    annotationManager.redrawAnnotation(rectangleAnnotation);

    // Trigger an event to let Appian know we've created an annotation
    appianManager.saveValue('onCustomEvent', { type: 'annotationCreate', message: 'test' })
  }
});
