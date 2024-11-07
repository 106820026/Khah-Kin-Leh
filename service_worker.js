let bug_data, highlight, color_dict
chrome.windows.getCurrent(function(window) {
    current_active_window = window.id
})
chrome.runtime.onMessage.addListener(
    async function(message, sender, sendResponse) {
        switch(message.type) {
            case "read_bug_data":
                chrome.scripting.executeScript({
                    target: {tabId: await getCurrentTabId()},
                    files: ['./scripts/read_bug_data.js']
                })
                break;
            case "send_bug_data":
                bug_data = message.bug_data
                break;
            case "get_bug_data":
                sendResponse(bug_data)
                break;
            case "read_color_code":
                fetch("../data/color_code.json").then(response => {
                    if(response.ok) {return response.json()}
                }).then(data => {
                    color_dict = data
                })
                break;
            case "get_color_code":
                sendResponse(color_dict)
                break;
            case "highlight_color_code":
                chrome.scripting.executeScript({
                    target: {tabId: await getCurrentTabId()},
                    files: ['./scripts/highlight_color_code.js']
                })
                break;
            case "highlight_translation_difference":
                chrome.scripting.executeScript({
                    target: {tabId: await getCurrentTabId()},
                    files: ['./scripts/highlight_translation_difference.js']
                })
                break;
            default:
                console.error("Unrecognised message type: ", message.type);
        }
    }
)

// 取得目前tab ID
async function getCurrentTabId() {
    try {
        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab.id;
    }catch(err) {
        console.log(err)
    }
}