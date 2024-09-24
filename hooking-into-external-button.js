/**
 * Submit Button - suppose we want to use a submit button to save the document
 * a!buttonWidget(
          label: "Submit",
          submit: true,
          style: "SOLID",
          saveInto: {a!save(
            local!isSubmitting, // We need this variable to trigger the save event in the viewer. This will be true when pressed.
            true
          )
        })
    }
 */
/**
 * WebViewer - You can hook into the viewer to save the document when the submit button is pressed.
 * webviewer(
        ...
        configFileId: cons!MY_CONFIG_FILE,
        // This will provide the submitting flag to the viewer. True when the button is pressed. False when the custom event is triggered.
        customData: {
            type: "submit",
            isSubmitting: local!isSubmitting,
        },
        onCustomEvent: {
            local!eventData, // The data we submitted back from the viewer.
            a!save(
                local!test,
                base64todocumentversion(    // Use the smart service to convert the base64 string to a document version. This saves the document.
                    local!eventData.base64String,
                    document(
                        cons!MY_DOCUCUMENT,
                        "id"
                    )
                )
            ),
            a!save(
                local!isSubmitting,
                false,
            )
        },
        ...
    )
 */

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
}

instance.UI.addEventListener(instance.UI.Events.VIEWER_LOADED, () => {
    const {
        annotationManager,
        documentViewer,
    } = instance.Core;

    // Triggers whenever the submit button is pressed (when any new values are provided by Appian really)
    window.addEventListener('newAppianValues', async function (event) {
        // Check the flag to see if the submit button was pressed (we passed this in the custom data)
        if (event.detail.newValues.customData.isSubmitting) {
            const xfdfString = await annotationManager.exportAnnotations();
            const fileData = await documentViewer.getDocument().getFileData({
                xfdfString,
                flatten: true, // Optional
            });
            const base64String = arrayBufferToBase64(fileData);

            // Trigger the custom component event. Type is optional, but recommended to differentiate between different events.
            appianManager.saveValue('onCustomEvent', { type: 'externalButtonPress', base64String });
        }
    });
});
