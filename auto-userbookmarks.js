/**
 * This script will load the documents from Appian, merge them into a single document, and create bookmarks for each document in the merged file.
 */

// A class to track the documents and create bookmarks
class DocumentTracker {
  constructor(instance, appianManager) {
    this.instance = instance;
    this.appianManager = appianManager;
    this.documentIds = [];
    this.documents = {};
  }
  async addDocument(docId) {
    if (this.documents[docId]) {
      return;
    }
    // Load the document from Appian
    const { docData, docName } = await this.appianManager.loadDocument(docId);
    // Create the document in WebViewer
    const doc = await this.instance.Core.createDocument(docData, { filename: docName, loadAsPDF: true });
    this.documentIds.push(docId);
    this.documents[docId] = {
      doc,
      docName,
    };
  }
  createUserBookmarks(appianDocIds) {
    let pageCount = 0;
    // Create bookmarks for each document using the page count of the previous documents
    const bookmarks = appianDocIds.reduce((acc, docId) => {
      const { doc, docName } = this.documents[docId];
      acc[pageCount] = docName;
      pageCount += doc.getPageCount();
      return acc;
    }, {});
    return bookmarks;
  }
  reset() {
    this.documentIds = [];
    this.documents = {};
  }
}

let documentTracker;
let latestAppianValues;
let trackingPromise;

window.addEventListener('newAppianValues', async function (event) {
  if (event.detail.newValues) {
    latestAppianValues = event.detail.newValues;
  }

  // Track when multiple IDs are passed to the component
  if (latestAppianValues.appianDocId) {
    trackingPromise = trackDocuments();
  }
});

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
  documentTracker = new DocumentTracker(instance, window.appianManager);

  // Manually run this the first time as the values update before this event.
  trackingPromise = trackDocuments();

  instance.UI.enableElements(['bookmarksPanel', 'bookmarksPanelButton']);

  // Create the bookmarks when the annotations are loaded, which occurs after the document is loaded
  instance.Core.documentViewer.addEventListener('annotationsLoaded', async () => {
    await trackingPromise;
    const bookmarks = documentTracker.createUserBookmarks(latestAppianValues.appianDocId);
    instance.UI.importBookmarks(bookmarks);
    console.log('BOOKMARKS', bookmarks);
  });
});

const trackDocuments = async () => {
  if (documentTracker) {
    documentTracker.reset();

    const loadPromises = latestAppianValues.appianDocId.map(docId => documentTracker.addDocument(docId));
    await Promise.all(loadPromises);
    console.log('ORDER', latestAppianValues.appianDocId);
  }
};
