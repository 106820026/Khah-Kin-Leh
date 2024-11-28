let bug_data, highlight, color_dict
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "read_bug_data":
                asyncExecuteScript(['./scripts/read_bug_data.js']).then((result) => {
                    sendResponse(result)
                })
                return true // 告知非同步回應
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
                asyncExecuteScript(['./scripts/highlight_color_code.js'])
                break;
            case "highlight_translation_difference":
                asyncExecuteScript(['./scripts/highlight_translation_difference.js'])
                break;
            default:
                console.error("Unrecognised message type: ", message.type);
        }
    }
)

// 讓Promise可以傳回pup up 因為onMessage加了async會無法傳訊息過去 參考https://stackoverflow.com/questions/53024819/sendresponse-not-waiting-for-async-function-or-promises-resolve
async function asyncExecuteScript(files) {
    const result = await chrome.scripting.executeScript({
        target: {tabId: await getCurrentTabId()},
        files: files
    })
    return result[0].result
}

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