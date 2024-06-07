/**
 * This script will automatically redact any text that matches a pattern in the document.
 */
let docId;

// Listen for new values from Appian
window.addEventListener('newAppianValues', e => {
  // Track which document we're on so we can save later
  docId = e.detail.newValues.appianDocId[0];
});

// Event for when a document is loaded
instance.UI.addEventListener(instance.UI.Events.DOCUMENT_LOADED, async () => {
  const { annotationManager, documentViewer, Annotations, Search } = instance.Core;

  const redactions = [];
  
  const pattern = '[A-Z][0-9]{8,12}';
  // Start a text search for the pattern
  await documentViewer.textSearchInit(pattern, [Search.Mode.PAGE_STOP, Search.Mode.HIGHLIGHT, Search.Mode.REGEX], {
    fullSearch: true,
    // On each result, create a redaction annotation
    onResult: result => {
      if (result.resultCode === Search.ResultCode.FOUND) {
        const textQuads = result.quads.map(quad => {
          // Convert to Annotations.Quad
          const q = quad.getPoints();
          return new Annotations.Quad(q.x1, q.y1, q.x2, q.y2, q.x3, q.y3, q.x4, q.y4);
        });
        // Now that we have the result Quads, it's possible to highlight text or create annotations on top of the text
        const redactAnnot = new Annotations.RedactionAnnotation({
          PageNumber: result.pageNum,
          Quads: textQuads,
          StrokeColor: new Annotations.Color(255, 0, 0, 1),
          IsText: true, // Create either a text or rectangular redaction
        });
        annotationManager.addAnnotation(redactAnnot);

        // Need to draw the annotations otherwise they won't show up until the page is refreshed
        annotationManager.drawAnnotationsFromList([redactAnnot]);

        redactions.push(redactAnnot);
      }
    },
  });

  // Apply the redactions to the document. Need to apply it twice to ensure the redactions are saved.
  const results = await annotationManager.applyRedactions(redactions);
  await annotationManager.applyRedactions(redactions);

  // Get the file data to save
  const doc = documentViewer.getDocument();
  const filename = doc.getFilename();
  const xfdf = await annotationManager.exportAnnotations();
  const fileData = await doc.getFileData({ xfdfString: xfdf });

  // Save the redacted document to Appian
  // await appianManager.saveDocument(custom.documentFolder, docId, filename, fileData);

  // Trigger an event to let Appian know we've saved, and can move to the next document
  appianManager.saveValue('onCustomEvent', { type: 'redactSaveEvent', docId });
});
