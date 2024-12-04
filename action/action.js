// COPY RIGHT XDD
var ivy = `%c
  __  __           _        ____          _____           
 |  \\/  |         | |      |  _ \\        |_   _|          
 | \\  / | __ _  __| | ___  | |_) |_   _    | |_   ___   _ 
 | |\\/| |/ _\` |/ _\` |/ _ \\ |  _ <| | | |   | \\ \\ / / | | |
 | |  | | (_| | (_| |  __/ | |_) | |_| |  _| |\\ V /| |_| |
 |_|  |_|\\__,_|\\__,_|\\___| |____/ \\__, | |_____\\_/  \\__, |
                                   __/ |             __/ |
                                  |___/             |___/ 
`
console.log(ivy, 'color:White; background-color:Black;')


////////////
// Global //
////////////

// text area自動調整大小
$('textarea').on('input', (event) => {
    $(event.target).css("height", "1px")
    $(event.target).css("height", (event.target.scrollHeight) + 2 + "px") // 多+2是因為有padding
})

// 從連結下載
url = "https://sheets.googleapis.com/v4/spreadsheets/1kTTQCl6WuBNwbny4GoBkGBK84V0XnCVY7wgY0IlFsrE/values/A1:B2?key=AIzaSyBQSuRYGNzBxwZFUHqlhZnfhfyZN6YXPnM"
function downloadURL(url) {
    var link = document.createElement("a");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

// 是否詢問更新
update_request = 1
chrome.storage.local.get("update_request").then((result) => {
    if(result["update_request"] != null){
        update_request = result["update_request"]
    }else{
        chrome.storage.local.set({"update_request": 1 }).then(() => {})
    }
})

// 讀取manifest.json中的版本
fetch("../manifest.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    current_version = data.version
    $("#version").text("Version " + current_version)
    // 取得最新版版本
    fetch(url).then(response => {
        if(response.ok) {return response.json()}
    }).then(data => {
        latest_version = data.values[1][0] // 版本號
        latest_file = data.values[1][1] // 下載連結
        // 如果版本不同
        if(current_version != latest_version){
            // 只提醒一次
            if(update_request){
                // 按確認
                if(confirm("Latest version available! Do you want to download now?") == true) {
                    downloadURL(latest_file)
                }else{ // 按取消 同時會新增一個下載的icon
                    chrome.storage.local.set({"update_request": 0 }).then(() => {})
                    $("#version").append(" <i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>")
                }
            }else{
                $("#version").append(" <i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>")
            }
            $("#version>.fa-download").on("click", () => {
                downloadURL(latest_file)
                console.log($("#version").html())
                $("#version").html($("#version").html().replace("<i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>", "<i class=\"fa-solid fa-check\"></i>"))
            })
        }else{
            // 開啟下次更新
            chrome.storage.local.set({"update_request": 1 }).then(() => {})
        }
}).catch(err => {
    console.log("Error while fetching color_code.json: ", err)
})
}).catch(err => {
    console.log("Error while fetching manifest.json: ", err)
})

// 切換tab
$("#file_naming_tab").on("click", function() {
    openTab("file_naming")
    chrome.storage.local.set({"tab": "file_naming" }).then(() => {})
})
$("#xloc_tab").on("click", function() {
    openTab("xloc")
    chrome.storage.local.set({"tab": "xloc" }).then(() => {})
})
$("#new_bug_tab").on("click", function() {
    openTab("new_bug")
    chrome.storage.local.set({"tab": "new_bug" }).then(() => {})
})
$("#profile_tab").on("click", function() {
    openTab("profile")
    chrome.storage.local.set({"tab": "profile" }).then(() => {})
})
// 切換tab的function
function openTab(tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    $("#" + tabName + "_tab").addClass("active")
}
// 決定目前要開啟的tab
chrome.storage.local.get("tab").then((result) => {
    if(result["tab"] != null){
        openTab(result["tab"])
    }else{
        openTab("profile")
    }
})

// footer 的report error(目前連結是我的slack profile)
$('a.report').on('click', function(){
    chrome.tabs.create({url: $(this).attr('href')})
    return false
})

/////////////////
// New Bug Tab //
/////////////////

let jira_labels = ""
let num_lock = true
// 從localstorage讀Summary資料
chrome.storage.local.get("summary").then((result) => {
    if(result["summary"] != undefined){
        $("#summary").val(result["summary"])
    }
})
// 當Summary有修改時 上傳localstorage
$("#summary").on("input", function() {
    chrome.storage.local.set({"summary": $("#summary").val()})
})
// 從localstorage讀season資料
chrome.storage.local.get("season_num").then((result) => {
    if(result["season_num"] != undefined){
        $("#season_num").val(result["season_num"])
    }else{
        $("#season_num").val("1")
    }
    jira_labels = "Loc_S" + $("#season_num").val() + " " // 預設把season label加上去
    $("#season_num").prop('disabled', num_lock)
})
// 當season有修改時 上傳localstorage
$("#season_num").change(() => {
    chrome.storage.local.set({"season_num": $("#season_num").val()})
})
// 從localstorage讀found CL資料
chrome.storage.local.get("found_cl").then((result) => {
    if(result["found_cl"] != undefined){
        $("#found_cl").val(result["found_cl"])
    }
})
// 當Found CL有修改時 上傳localstorage
$("#found_cl").change(() => {
    chrome.storage.local.set({"found_cl": $("#found_cl").val()})
})
// 從localstorage讀Location資料
chrome.storage.local.get("location").then((result) => {
    if(result["location"] != undefined){
        $("#location").val(result["location"])
    }
})
// 當Location有修改時 上傳localstorage
$("#location").change(() => {
    chrome.storage.local.set({"location": $("#location").val()})
})
// 從localstorage讀Resource IDs資料
chrome.storage.local.get("resource_ids").then((result) => {
    if(result["resource_ids"] != undefined){
        $("#resource_ids").val(result["resource_ids"])
        // 把textarea展開
        $("#resource_ids").css("height", "1px") // textarea和input的預設大小是19px 看起來比較一致
        $("#resource_ids").css("height", ($("#resource_ids").prop('scrollHeight')) == 0 ? "21px" : ($("#resource_ids").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Resource IDs有修改時 上傳localstorage
$("#resource_ids").change(() => {
    chrome.storage.local.set({"resource_ids": $("#resource_ids").val()})
})
// 蒐集選擇的labels
$(".add_label").on("click", (event) => {
    let _label = $(event.target).text() + " " // tag需要加空格避免和其他tag打架
    if(_label == "Season "){
        _label = "Loc_S" + $("#season_num").val() + " "
        num_lock = !num_lock
        $("#season_num").prop('disabled', num_lock)
    }
    if(!jira_labels.includes(_label)) {
        $(event.target).css("background-color", "#ACACAC")
        jira_labels += _label
    }else {
        $(event.target).css("background-color", "buttonface")
        jira_labels = jira_labels.replace(_label, "")
    }
    // 儲存至local storage
    // chrome.storage.local.set({"selected_label": jira_labels})
})
// 打開衍伸的labels(Text, Audio, Subtitle, Telescope)
$("button.advanced_type").on('click', function() {
    if($(this).css('background-color') == "rgb(172, 172, 172)") {
        $("div." + $(this).text().split("_")[1] + "_specific").show()
    }else{
        $("div." + $(this).text().split("_")[1] + "_specific").hide()
    }
})
// 清除所有input並更新至local storage
function clear_input(preserve_text = false) {
    $(".add_label").css("background-color", "buttonface")
    $(".specific_label").hide()
    $("#resource_ids").val("")
    chrome.storage.local.set({"resource_ids": ""})
    jira_labels = ""
    if(!preserve_text) {
        $("#summary").val("")
        chrome.storage.local.set({"summary": ""})
        $("#found_cl").val("")
        chrome.storage.local.set({"found_cl": ""})
        $("#location").val("")
        chrome.storage.local.set({"location": ""})
        $("#season_label").css("background-color", "#ACACAC")
    }
    
}
$("#clear_input").on("click", () => {
    clear_input()
})
// 開啟new bug頁
$("#create_bug").on("click", ()=> {
    let username = $("#profile_username").val()
    let LNG = $("#multi_lng").is(":checked") ? "FIGS/RU/PL/AR/PTBR/MX/KO/ZHS/ZHT/JA" : $("#profile_lng option:selected").val()
    // 確認基本資料有填寫
    if(username == ""){
        alert("Please Enter the username in Profile Tab and Check if the Language is Correct!")
        return
    }
    let area = "Global", level_query = "&customfield_10306=30237&customfield_10360=10814", priority_query = "&priority=11103", location = $("#location").val() != "" ? $("#location").val() : "Location"
    if(jira_labels.includes("Loc_SP")){
        area = "SP"
        level_query = "&customfield_10306=12518&customfield_10306:1=16515&customfield_10360=10809"
    }
    else if(jira_labels.includes("Loc_MP")){
        area = "MP"
        level_query = "&customfield_10306=12521&customfield_10306:1=26409&customfield_10360=10810"
    }
    else if(jira_labels.includes("Loc_ZM")){
        area = "ZM"
        level_query = "&customfield_10306=12524&customfield_10306:1=26410&customfield_10360=18301"
    }
    else if(jira_labels.includes("Loc_WZ")){
        area = "WZ"
        level_query = "&customfield_10306=26100&customfield_10306:1=26038&customfield_10360=10812"
    }
    let high_priority_issue = [
        "Overlap", "Consisency", "Context", "Truncation", "Not_Translated", "Missing", "Mismatch", "Audio_Cut", "SFX", "Sync", "Glossary", "Safe"
    ]
    if(high_priority_issue.some(issue => jira_labels.includes(issue))){
        priority_query = "&priority=11102"
    }
    let resource_ids = $("#resource_ids").val().trim().replaceAll("\n", "%0A")
    let label_query = "&labels=Loc&labels=Loc_Cerberus&labels=Loc_" + LNG + (jira_labels.length > 0 ? jira_labels.trim().split(" ").map(label => "&labels=" + label).join("") : "")
    if($("#multi_lng").is(":checked")) {
        label_query = label_query.replace("&labels=Loc_" + LNG, "")
    }
    let atvi_type_query = jira_labels.includes("Audio") ? "&customfield_10364=11338" : "&customfield_10364=11351"
    let atvi_type = {
        "Loc_Text_Overlap": "11352", "Loc_Text_Truncation": "11353", "Loc_Text_Missing": "11354", "Loc_Text_Context": "11355",
        "Loc_Text_Graphic": "28445", "Loc_Text_Not_Translated": "28441", "Loc_Audio_Missing": "11356", "Loc_Audio_Context": "11357",
        "Loc_Audio_Text_Integration": "11358", "Loc_Audio_Cut": "28442", "Loc_Audio_Overlap": "28443", "Loc_Audio_Not_Translated": "28444",
        "Loc_Arabic_Safe": "28446", "Loc_German_Safe": "28446", "Loc_Japanese_Safe": "28446"
    }
    Object.keys(atvi_type).forEach(type => {
        if(jira_labels.includes(type)){
            atvi_type_query = "&customfield_10364=" + atvi_type[type]
        }
    })
    let loc_lng = {
        "FR": "11396", "IT": "11397", "DE": "11398", "ES": "11399", "RU": "11400", "PL": "11401", "AR": "11409",
        "PTBR": "11402", "MX": "11403", "KO": "11408", "ZHS": "11406", "ZHT": "11405", "JA": "11407",
        "FIGS/RU/PL/AR/PTBR/MX/KO/ZHS/ZHT/JA":
        "11396&customfield_10446=11397&customfield_10446=11398&customfield_10446=11399&customfield_10446=11400&customfield_10446=11401" +
        "&customfield_10446=11409&customfield_10446=11402&customfield_10446=11403&customfield_10446=11408&customfield_10446=11406" +
        "&customfield_10446=11405&customfield_10446=11407&customfield_10446=11394"
    }
    let loc_lng_query = "&customfield_10446=" + loc_lng[LNG]
    let loc_type_query = ""
    let loc_type = {
        "Loc_Arabic_Safe": "11434", "Loc_Audio_Consistency": "11425", "Loc_Audio_Context": "11424", "Loc_Audio_Cut": "11426",
        "Loc_Audio_Context": "16201", "Loc_Audio_Consistency": "16201", "Loc_Audio_Text_Integration": "11431", "Loc_Audio_Missing": "11422",
        "Loc_Audio_Not_Translated": "11423", "Loc_Audio_Overlap": "11427", "Loc_Audio_SFX": "11429", "Loc_Audio_Sync": "11428",
        "Loc_Audio_Volume": "11430", "Loc_German_Safe": "11435", "Loc_Japanese_Safe": "11436", "Loc_Subtitle_Amendment": "26069",
        "Loc_Subtitle_Consistency": "26068", "Loc_Subtitle_Context": "26067", "Loc_Subtitle_Integration": "28701", "Loc_Subtitle_Mismatch": "11421",
        "Loc_Subtitle_Missing": "30501", "Loc_Subtitle_Not_Translated": "30500", "Loc_Subtitle_Spelling_Grammar": "26070", "Loc_Text_Alignment": "11419",
        "Loc_Text_Amendment": "11415", "Loc_Text_Consistency": "11414", "Loc_Text_Context": "11413", "Loc_Text_Font_Size": "11420",
        "Loc_Text_Graphic": "11418", "Loc_Text_Integration": "16205", "Loc_Text_Missing": "11410", "Loc_Text_Not_Translated": "11411",
        "Loc_Text_Overlap": "11417", "Loc_Text_Spelling_Grammar": "11412", "Loc_Text_Truncation": "11416"
    }
    Object.keys(loc_type).forEach(type => {
        if(jira_labels.includes(type)){
            loc_type_query = "&customfield_10447=" + loc_type[type]
        }
    })
    // 移除影響query string的符號
    let summary_detail = $("#summary").val().replace("&", "%26").replace("=", "%3D")
    let issue_type_1 = $(".issue_type_1[style='background-color: rgb(172, 172, 172);']").text().replace("Loc_", "").toUpperCase()
    let issue_type_2 = $(".issue_type_2[style='background-color: rgb(172, 172, 172);']").text().replace($(".issue_type_1[style='background-color: rgb(172, 172, 172);']").text() + "_", "").replace("_", "/").toUpperCase()
                       
    let high_priority_type_2 = ["Loc_Arabic_Safe", "Loc_German_Safe", "Loc_Japanese_Safe"]
    high_priority_type_2.forEach(type => {
        if(jira_labels.includes(type)){
            issue_type_2 = type.replace("Loc_", "").replace("_", " ")
        }
    })
    let summary = "LOC%3A%20CER%20%E2%80%93%20PS4%2FPS5%2FX1%2FXSX%2FPC%20%E2%80%93%20" + LNG + "%20%E2%80%93%20" + issue_type_1 + 
                  "%20%E2%80%93%20" + issue_type_2 + "%20%E2%80%93%20" + area + "%2F" + location + "%20%E2%80%93%20" + summary_detail
    if(jira_labels.includes("Telescope")) {summary = summary + " [Telescope]"}
    let amend_in_xloc_type = ["Amendment", "Consistency", "Context", "Not_Translated", "Spelling_Grammar"]
    let project = jira_labels.includes("Subtitle") ? " Linebooks": ""
    let action_required = amend_in_xloc_type.some(type => jira_labels.includes(type)) ?
                          "Please%20modify%20the%20translations%20as%20suggested%20in%20the%20Excel for COD 2024" + project + " | Cerberus." : 
                          "Please%20investigate%20and%20fix%20it."
    let description = 
    "*REPRO STEPS*%0A" +
    "----%0A" +
    "1%29%20Boot up CER in " + (LNG.split("/").length == 1 ? LNG : "affected LNG") + " on PS4/PS5/PC/X1/XSX%0A" +
    "2%29%20%0A" +
    "3%29%20Observe the issue%0A%0A" +
    "*BUG OBSERVED*%0A" +
    "----%0A" +
    summary_detail + "%0A%0A%5C%5C%20" +
    "Please check the screenshot attached for further details.%0A%0A" +
    "*ACTION REQUIRED*%0A" +
    "----%0A" +
    action_required + "%20Thanks!%0A%0A" +
    "*RESOURCE%20ID*%0A" +
    "----%0A" + resource_ids + "%0A%0A%5C%5C%20" +
    "keywords%3A"

    let query_string_url = 
    "https://dev.activision.com/jira/secure/CreateIssueDetails!init.jspa?issuetype=10203&pid=10201&components=26600&customfield_10325=10443&customfield_10319=10416" +
    "&customfield_10900=12800&reporter=" + username + "&customfield_10362=11096" + "&summary=" + summary + "&description=" + description +
    "&assignee=" + username + "&customfield_10307=" + $("#found_cl").val().trim() + priority_query + label_query + level_query + "&reporter=" + username +
    atvi_type_query + loc_lng_query + loc_type_query + "&customfield_12303=" + resource_ids

    // 使用Query String在新分頁開啟Log Bug頁
    chrome.tabs.create({url: query_string_url})
    clear_input(true)
    return false
})

//////////////////////
// File Naming page //
//////////////////////

// 當Release ID有修改且Regression Lock打勾時 上傳localstorage
$("#release_id").on("input", function() {
    if($("#regression_lock").is(":checked")){
        chrome.storage.local.set({"release_id": $("#release_id").val()})
    }
})

// Regression Lock打勾資訊和目前的release ID 上傳localstorage
current_release_id = ""
$('#regression_lock').change(function() {
    chrome.storage.local.set({"regression_lock": $("#regression_lock").is(":checked")})
    if($("#regression_lock").is(":checked")){
        chrome.storage.local.set({"release_id": $("#release_id").val()})
    }else{
        $("#release_id").val(current_release_id)
    }
    updateFileName()
})
// 取得localstorage上Regression Lock打勾資訊
chrome.storage.local.get("regression_lock").then((result) => {
    if(result["regression_lock"] != undefined){
        $("#regression_lock").prop('checked', result["regression_lock"])
    }
})

full_name_lang = ["EN", "FR", "IT", "DE", "ES", "RU", "PL", "AR", "ENAR", "PTBR", "MX", "KO", "ZHS", "ZHT", "JA", "TH"]
abbreviate_lang = {"E": "EN", "F": "FR", "I": "IT", "G": "DE", "S": "ES"}
// 取得jira上的bug資訊 填入file naming tab中 !!!同時也把bug number貼在Regression page
async function read_bug_data() {
    const bug_data = await chrome.runtime.sendMessage({type: "read_bug_data"});
    if(bug_data == null){
        console.log("Cannot get bug data from service_worker.js")
    }else{
        $("#current_bug").text("Currrent bug: " + bug_data.bug_id)
        $("#bug_id").val(bug_data.bug_id)
        $("#bug_type_1").val(bug_data.bug_type_1)
        $("#bug_type_2").val(bug_data.bug_type_2)
        for(language of bug_data.language.split("/")){
            if(!full_name_lang.includes(language)){
                for(al of language.split("")){
                    let selection = abbreviate_lang[al] == $("#profile_lng option:selected").val() ? "selected" : ""
                    $("#bug_lng_select").append("<option value=\"" + abbreviate_lang[al] + "\" " + selection + ">" + abbreviate_lang[al] + "</option>")
                }
            }else{
                let selection = language == $("#profile_lng option:selected").val() ? "selected" : ""
                $("#bug_lng_select").append("<option value=\"" + language + "\" " + selection + ">" + language + "</option>")
            }
        }
        if($("#regression_lock").is(":checked")){
            await chrome.storage.local.get("release_id").then((result) => {
                if(result["release_id"] != undefined){
                    $("#release_id").val(result["release_id"])
                }
            })
        }else{
            $("#release_id").val(bug_data.release_id)
        }
        current_release_id = bug_data.release_id
        $("#file_name").val(($("#bug_id").val() + "_" + $("#bug_lng_select option:selected").text() + "_" + $("#bug_type_1").val() + "_" + $("#bug_type_2").val().replace("/", "_") + "_" + $("#release_id").val()))
    }
}
read_bug_data()

// 更新檔案名稱
function updateFileName() {
    $("#file_name").val(
        // 防止有因為bug_type_2是空值導致的連續底線 和 /
        ($("#bug_id").val() + "_" + $("#bug_lng_select").val() + "_" + $("#bug_type_1").val() + "_" + $("#bug_type_2").val() + "_" + $("#release_id").val()).replaceAll("__", "_").replace("/", "_")
    )
}
// 語言切換
$("#bug_lng_select").change(() => {
    updateFileName()
})
// 輸入更新時 更新檔案名稱
$("#release_id").on("input", function() {
    updateFileName()
})
// 按下filename複製
$("#file_name_copy").on("click", () => {
    navigator.clipboard.writeText($("#file_name").val()).then(() => {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        alert('Async: Could not copy text: ', err);
    });
})
// 按下_1, _2, _3...
$(".add_postfix").on("click", (event) => {
    let reg = new RegExp('_[0-9]$')
    let tag = $(event.target).text()
    let str = $("#file_name").val()
    if(reg.test(str)){
        if(str.substring(str.length - 2) == tag){
            $("#file_name").val(str.substring(0, str.length - 2))
            $(".add_postfix").css("background-color", "buttonface")
        }else{
            $("#file_name").val(str.substring(0, str.length - 2) + tag)
            $(".add_postfix").css("background-color", "buttonface")
            $(event.target).css("background-color", "#ACACAC")
        }
    }else{
        $("#file_name").val(str + tag)
        $(event.target).css("background-color", "#ACACAC")
    }
})

///////////////
// Xloc Page //
///////////////
let color_dict, color_codes = null

// 從color_code.json讀取資料
fetch("../data/color_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    color_dict = data
    color_codes = Object.keys(color_dict)
}).catch(err => {
    console.log("Error while fetching color_code.json: ", err)
})

// color code字串輸入監聽
$("#color_code_string").on("input", function() {
    convert_to_colored_string()
})
// color code淺色背景
$("#light_bg").change(function() {
    if($("#light_bg").is(":checked")) {$("#colored_string").css("background-color", "Gold")}
    else {$("#colored_string").css("background-color", "#333333")}
})

// 將color code轉成顏色
function convert_to_colored_string() {
    console.log("Converting to colored string")
    let color_code_string = $("#color_code_string").val()
    if(color_codes.some(color_code => color_code_string.includes(color_code))) {
        color_code_string = color_code_string.replaceAll("\\n", "<br>") // 換行符號改成html使用的
        color_code_string = color_code_string.replaceAll("[{ui_font_bullet_point}]", "<span style=\"font-size: 30px\">&#8226;</span>") // 項目符號改成html使用的
        color_code_string = color_code_string.replaceAll("[{ui_codpoints}]", "&#128176;") // coin
        color_code_string = color_code_string.replaceAll("[{ui_lock}]", "&#128274;") // lock
        color_codes.map(function(element) { // 把color code逐一檢查
            if(color_code_string.includes(element)) {
                color_code_string = color_code_string.replaceAll(element, "</span><span style=\"color: " + color_dict[element] + "\">")
            }
        })
        color_code_string = color_code_string.replace("</span>", "") // 把第一個多加的</span>去掉
        color_code_string = color_code_string + "</span>" // 把最後少加的</span>加回去
        $("#colored_string").empty()
        $("#colored_string").append(color_code_string)
    }else{
        $("#colored_string").empty()
        $("#colored_string").append("<span style='color: red; font-weight: bolder;'>Color code Error!<span>")
    }
}
$("#translation_contrast").on("click", () => {
    chrome.runtime.sendMessage({type: "highlight_translation_difference", value: true})
})

$("#toggle_highlight").on("click", () => {
    chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
})

$("#clear_search").on("click", () => {
    $("#color_code_string").val("")
})

/////////////////
// Profile Tab //
////////////////

chrome.storage.local.get("profile_lng").then((result) => {
    $("#" + result["profile_lng"]).attr('selected','selected')
})
chrome.storage.local.get("profile_username").then((result) => {
    $("#profile_username").val(result["profile_username"])
})
$("#profile_lng").change(() => {
    chrome.storage.local.set({"profile_lng": $("#profile_lng option:selected").val()})
})
$("#profile_username").on("input", function() {
    chrome.storage.local.set({"profile_username": $("#profile_username").val()})
})

$("#check_username").on("click", function() {
    chrome.tabs.create({url: "https://dev.activision.com/jira/secure/ViewProfile.jspa"})
    return false
})