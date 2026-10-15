
package views.actionitemviews.learning
{
    import org.apache.royale.jewel.Alert;

    public class ImportExportChat
    {
        private static const TRANSCRIPT_FORMAT:String =
            "learning-chat-transcript";

        // --------------------------------------------------
        // EXPORT
        // --------------------------------------------------

        public function exportChatJson(
            conversationId:String,
            transcriptEntries:Array
        ):void
        {
            try
            {
                if (transcriptEntries == null)
                {
                    Alert.show(
                        "There is no transcript to export.",
                        "Export Error"
                    );
                    return;
                }

                var transcript:Object = {
                    format: TRANSCRIPT_FORMAT,
                    version: 2,
                    conversationId: conversationId,
                    exportedAt: new Date().toString(),
                    entries: transcriptEntries
                };

                var json:String = JSON.stringify(
                    transcript,
                    null,
                    2
                );

                if (json == null || json == "")
                {
                    Alert.show(
                        "Unable to prepare the transcript for export.",
                        "Export Error"
                    );
                    return;
                }

                saveJsonFile(
                    json,
                    "learning-chat-transcript.json"
                );
            }
            catch (exportError:Error)
            {
                trace("JSON export failed: " + exportError.message);

                Alert.show(
                    "Failed to export the JSON transcript.",
                    "Export Error"
                );
            }
        }

        private function saveJsonFile(
            content:String,
            filename:String
        ):void
        {
            var url:String = null;
            var urlApi:Object = null;
            var doc:Object = null;
            var link:Object = null;

            try
            {
                var blobClass:Class = window["Blob"] as Class;

                if (blobClass == null)
                {
                    throw new Error("Blob API is not available.");
                }

                var blob:Object = new blobClass(
                    [content],
                    {
                        type: "application/json;charset=utf-8"
                    }
                );

                urlApi = window["URL"];

                if (urlApi == null)
                {
                    throw new Error("URL API is not available.");
                }

                url = String(urlApi.createObjectURL(blob));

                doc = window["document"];
                link = doc.createElement("a");

                link.href = url;
                link.download = filename;

                doc.body.appendChild(link);
                link.click();
                doc.body.removeChild(link);
                link = null;

                // Give the browser time to begin the download.
                window["setTimeout"](
                    function():void
                    {
                        try
                        {
                            urlApi.revokeObjectURL(url);
                        }
                        catch (cleanupError:Error)
                        {
                            trace(
                                "Download URL cleanup failed: " +
                                cleanupError.message
                            );
                        }
                    },
                    1000
                );
            }
            catch (saveError:Error)
            {
                // Best-effort cleanup if the download setup failed.
                try
                {
                    if (link != null && doc != null &&
                        link.parentNode != null)
                    {
                        doc.body.removeChild(link);
                    }
                }
                catch (cleanupError:Error)
                {
                    trace("Link cleanup failed.");
                }

                try
                {
                    if (url != null && urlApi != null)
                    {
                        urlApi.revokeObjectURL(url);
                    }
                }
                catch (urlError:Error)
                {
                    trace("URL cleanup failed.");
                }

                trace("JSON export failed: " + saveError.message);

                Alert.show(
                    "Failed to export JSON file. Please try again.",
                    "Export Error"
                );
            }
        }

        // --------------------------------------------------
        // IMPORT
        // --------------------------------------------------

        public function importJsonFile(
            callBackFunction:Function
        ):void
        {
            try
            {
                if (callBackFunction == null)
                {
                    Alert.show(
                        "Transcript import is not configured.",
                        "Import Error"
                    );
                    return;
                }

                var doc:Object = window["document"];
                var input:Object = doc.createElement("input");

                input.type = "file";
                input.accept = ".json,application/json";

                input.onchange = function(event:Object):void
                {
                    // No body cleanup is needed because the input
                    // was never attached to the document.
                    loadJsonFile(input, callBackFunction);
                };

                input.click();
            }
            catch (inputError:Error)
            {
                trace("File selection failed: " + inputError.message);

                Alert.show(
                    "Unable to open the file picker.",
                    "Import Error"
                );
            }
        }

        private function loadJsonFile(
            inputFile:Object,
            callBackFunction:Function
        ):void
        {
            try
            {
                if (inputFile == null ||
                    inputFile["files"] == null ||
                    inputFile["files"].length == 0)
                {
                    // User may have cancelled the file picker.
                    return;
                }

                var file:Object = inputFile["files"][0];

                if (file == null)
                {
                    return;
                }

                var readerClass:Class =
                    window["FileReader"] as Class;

                if (readerClass == null)
                {
                    throw new Error("FileReader API is not available.");
                }

                var reader:Object = new readerClass();

                reader.onload = function(event:Object):void
                {
                    try
                    {
                        var parsed:Object =
                            JSON.parse(String(reader.result));

                        var entries:Array =
                            validateTranscript(parsed);

                        if (entries == null)
                        {
                            Alert.show(
                                "The selected file is not a valid " +
                                "learning chat transcript.",
                                "Import Error"
                            );
                            return;
                        }

                        callBackFunction(entries);
                    }
                    catch (parseError:Error)
                    {
                        trace(
                            "Transcript parsing failed: " +
                            parseError.message
                        );

                        Alert.show(
                            "Unable to read the JSON transcript. " +
                            "Please check the file format.",
                            "Import Error"
                        );
                    }
                };

                reader.onerror = function(event:Object):void
                {
                    Alert.show(
                        "Unable to read the selected file.",
                        "Import Error"
                    );
                };

                reader.readAsText(file);
            }
            catch (readError:Error)
            {
                trace("Transcript import failed: " + readError.message);

                Alert.show(
                    "Unable to open the selected JSON file.",
                    "Import Error"
                );
            }
        }

        // --------------------------------------------------
        // VALIDATION
        // --------------------------------------------------

        private function validateTranscript(
            parsed:Object
        ):Array
        {
            if (parsed == null ||
                parsed.format != TRANSCRIPT_FORMAT)
            {
                return null;
            }

            // Current format: ordered messages and module cards.
            if (parsed.entries is Array)
            {
                return parsed.entries as Array;
            }

            // Legacy format: messages-only transcript.
            if (parsed.messages is Array)
            {
                return parsed.messages as Array;
            }

            return null;
        }
    }
}