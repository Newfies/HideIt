chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["blacklist"], (data) => {

        if (!data.blacklist) {
            chrome.storage.sync.set({
                blacklist: [
                    {
                        term: "Your Name",
                        replacement: "#########",
                        caseSensitive: false
                    },
                    {
                        term: "123 Main Street",
                        replacement: "[HIDDEN]",
                        caseSensitive: false
                    }
                ]
            });
        }

    });
});