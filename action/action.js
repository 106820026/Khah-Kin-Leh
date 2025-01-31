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
url = "https://sheets.googleapis.com/v4/spreadsheets/1kTTQCl6WuBNwbny4GoBkGBK84V0XnCVY7wgY0IlFsrE/values/A1:C2?key=AIzaSyBQSuRYGNzBxwZFUHqlhZnfhfyZN6YXPnM"
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
        update_note = data.values[1][2] // 更新內容
        // 如果版本不同
        if(current_version != latest_version){
            // 只提醒一次
            if(update_request){
                // 按確認
                if(confirm("Latest version available! Do you want to download now?" + "\n" + update_note) == true) {
                    downloadURL(latest_file)
                }
            }
            chrome.storage.local.set({"update_request": 0 }).then(() => {})
            $("#version").append(" <i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>")
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
// 切換tab的function
function openTab(tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "selected"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" selected", "");
    }
  
    // Show the current tab, and add an "selected" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    $("#" + tabName + "_tab").addClass("selected")
    // 如果打開的頁面不是New Bug tab時 無法取得#resource_ids的滾動高度(因為display:none;) 所以每切換一次就讀一次
    $("#resource_ids").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
    $("#resource_ids").css("height", ($("#resource_ids").prop('scrollHeight')) == 20 ? "51px" : ($("#resource_ids").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    $("#summary").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
    $("#summary").css("height", ($("#summary").prop('scrollHeight')) == 20 ? "22px" : ($("#summary").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    // 當選擇new bug tab才顯示相關按鈕
    if(tabName == "new_bug") {
        $("#new_bug_action_button").css('display', 'flex')
    }else {
        $("#new_bug_action_button").hide()
    }
}
// 決定目前要開啟的tab
chrome.storage.local.get("tab").then((result) => {
    if(result["tab"] != null){
        openTab(result["tab"])
    }else{
        openTab("new_bug")
    }
})

// footer 的report error(目前連結是我的slack profile)
$('a#report').on("click", function(){
    chrome.tabs.create({url: $(this).attr('href')})
    return false
})

/////////////////
// New Bug Tab //
/////////////////

let jira_labels = ""
let season_lock = false, founc_cl_lock = false, fix_version_lock = false
// 從localstorage讀Summary資料
chrome.storage.local.get("summary").then((result) => {
    if(result["summary"] != undefined){
        $("#summary").val(result["summary"])
        // 把textarea展開
        $("#summary").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#summary").css("height", ($("#summary").prop('scrollHeight')) == 20 ? "22px" : ($("#summary").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Summary有修改時 上傳localstorage
$("#summary").on("input", function() {
    chrome.storage.local.set({"summary": $("#summary").val()})
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
// 從localstorage讀Found CL lock資料
chrome.storage.local.get("found_cl_lock").then((result) => {
    if(result["found_cl_lock"] != undefined){
        // true->鎖上
        if(result["found_cl_lock"]) {
            founc_cl_lock = true
            $("#found-cl-lock").removeClass("fa-lock-open").addClass("fa-lock")
            $("#found_cl").prop('disabled', founc_cl_lock)
        }
    }
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
// 從localstorage讀Fix Version資料
chrome.storage.local.get("fix_version").then((result) => {
    if(result["fix_version"] != undefined){
        $("#fix_version").val(result["fix_version"])
    }
})
// 當Fix Version有修改時 上傳localstorage
$("#fix_version").change(() => {
    chrome.storage.local.set({"fix_version": $("#fix_version").val()})
})
// 從localstorage讀Fix Version lock資料
chrome.storage.local.get("fix_version_lock").then((result) => {
    if(result["fix_version_lock"] != undefined){
        // true->鎖上
        if(result["fix_version_lock"]) {
            fix_version_lock = true
            $("#fix-version-lock").removeClass("fa-lock-open").addClass("fa-lock")
            $("#fix_version").prop('disabled', fix_version_lock)
        }
    }
})
// 從localstorage讀season資料
chrome.storage.local.get("season_num").then((result) => {
    if(result["season_num"] != undefined){
        $("#season_num").val(result["season_num"])
    }else{
        $("#season_num").val("1")
    }
    $("#season_label").prop('disabled', season_lock)
    $("#season_num").prop('disabled', season_lock)
})
// 從localstorage讀season label(checkbox)資料
chrome.storage.local.get("season_label").then((result) => {
    if(result["season_label"] != undefined){
        $("#season_label").prop("checked", result["season_label"])
    }
})
// 當season label(checkbox)有修改時 上傳localstorage
$("#season_label").change(() => {
    chrome.storage.local.set({"season_label": $("#season_label").is(":checked")})
})
// 從localstorage讀Season lock資料
chrome.storage.local.get("season_lock").then((result) => {
    if(result["season_lock"] != undefined){
        // true->鎖上
        if(result["season_lock"]) {
            season_lock = true
            $("#season-lock").removeClass("fa-lock-open").addClass("fa-lock")
            $("#season_label").prop('disabled', season_lock)
            $("#season_num").prop('disabled', season_lock)
        }
    }
})
// 從localstorage讀Resource IDs資料
chrome.storage.local.get("resource_ids").then((result) => {
    if(result["resource_ids"] != undefined){
        $("#resource_ids").val(result["resource_ids"])
        // 把textarea展開
        $("#resource_ids").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#resource_ids").css("height", ($("#resource_ids").prop('scrollHeight')) == 20 ? "51px" : ($("#resource_ids").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Resource IDs有修改時 上傳localstorage
$("#resource_ids").change(() => {
    chrome.storage.local.set({"resource_ids": $("#resource_ids").val()})
})
// 當All Languages有勾時 上傳localstorage
$("#multi_lng").change(() => {
    chrome.storage.local.set({"multi_lng": $("#multi_lng").is(":checked")})
})
// 從localstorage讀All Languages打勾資料
chrome.storage.local.get("multi_lng").then((result) => {
    if(result["multi_lng"] != undefined){
        $("#multi_lng").prop('checked', result["multi_lng"])
    }
})
// 從localstorage讀選擇的label資料
chrome.storage.local.get("labels").then((result) => {
    if(result["labels"] != undefined){
        result["labels"].split(",").forEach((id) => {
            $("#" + id).addClass("selected")
        })
        $(".add_label.advanced_type.selected").each(function() {
            $("." + $(this).text() + "_specific").show()
        })
        // 重新渲染顏色
        // applyTheme($("#theme option:selected").val())
    }else{
        reset_all()
    }
})
// Found cl是否鎖定
$("#found-cl-lock").on("click", function() {
    founc_cl_lock = !founc_cl_lock
    console.log(founc_cl_lock)
    founc_cl_lock ? $("#found-cl-lock").removeClass("fa-lock-open").addClass("fa-lock"):  $("#found-cl-lock").removeClass("fa-lock").addClass("fa-lock-open")
    $("#found_cl").prop('disabled', founc_cl_lock)
    // Found CL lock上傳localstorage
    chrome.storage.local.set({"found_cl_lock": !$("#found-cl-lock").hasClass("fa-lock-open")})
})
// Fix version是否鎖定
$("#fix-version-lock").on("click", function() {
    fix_version_lock = !fix_version_lock
    fix_version_lock ? $("#fix-version-lock").removeClass("fa-lock-open").addClass("fa-lock") :  $("#fix-version-lock").removeClass("fa-lock").addClass("fa-lock-open")
    $("#fix_version").prop('disabled', fix_version_lock)
    // Fix version lock上傳localstorage
    chrome.storage.local.set({"fix_version_lock": !$("#fix-version-lock").hasClass("fa-lock-open")})
})
// Season是否鎖定
$("#season-lock").on("click", function() {
    season_lock = !season_lock
    season_lock ? $("#season-lock").removeClass("fa-lock-open").addClass("fa-lock") :  $("#season-lock").removeClass("fa-lock").addClass("fa-lock-open")
    $("#season_label").prop('disabled', season_lock)
    $("#season_num").prop('disabled', season_lock)
    // Season lock上傳localstorage
    chrome.storage.local.set({"season_lock": !$("#season-lock").hasClass("fa-lock-open")})
})
// labels是否有被選擇
$(".add_label").on("click", function() {
    if($(this).hasClass("game_mode")) { // game mode防呆
        $(".game_mode").removeClass("selected")
        $(this).addClass("selected")
    }else if($(this).hasClass("safety_issue")) { // safety issue防呆
        $(".safety_issue").removeClass("selected")
        $(this).addClass("selected")
    }else if($(this).hasClass("issue_type_1")) { // issue type 1防呆
        $(".issue_type_1").removeClass("selected")
        $(this).addClass("selected")
        $(".issue_type_2").removeClass("selected")
    }else if($(this).hasClass("issue_type_2")) { // issue type 2防呆
        $(".issue_type_2").removeClass("selected")
        $(this).addClass("selected")
    }else if($(this).hasClass("selected")) {
        $(this).removeClass("selected")
    }else {
        $(this).addClass("selected")
    }
    // 當label選擇時 上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
})
// 打開衍伸的labels(Text, Audio, Subtitle, Telescope)
$("button.advanced_type").on("click", function() {
    $(".specific_label").hide()
    $("button.advanced_type.selected").each(function() {
        $("div." + $(this).val().split("_")[1] + "_specific").show()
        $("div." + $(this).val().split("_")[1] + "_specific .issue_type_2").first().addClass("selected")
    })
    // 當label選擇時 上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
})
// 清除所有input並更新至local storage
function reset_all() {
    // 清除所有欄位
    $(".add_label").removeClass("selected")
    $(".specific_label").hide()
    $("#multi_lng").prop('checked', false)
    $("#summary").val("")
    $("#location").val("")
    $("#resource_ids").val("")
    chrome.storage.local.set({"summary": ""})
    chrome.storage.local.set({"location": ""})
    chrome.storage.local.set({"resource_ids": ""})
    chrome.storage.local.set({"multi_lng": $("#multi_lng").is(":checked")})
    // 選擇預設選項
    $(".game_mode").first().addClass("selected")
    $(".issue_type_1").first().addClass("selected")
    $(".safety_issue").first().addClass("selected")
    $(".issue_type_2").first().addClass("selected")
    $(".specific_label").first().show()
    jira_labels = ""
    //檢查有無上鎖部分
    if($("#found-cl-lock").hasClass("fa-lock-open")) {
        $("#found_cl").val("")
        chrome.storage.local.set({"found_cl": ""})
    }
    if($("#fix-version-lock").hasClass("fa-lock-open")) {
        $("#fix_version").val("")
        chrome.storage.local.set({"fix_version": ""})
    }
    if($("#season-lock").hasClass("fa-lock-open")) {
        $("#season_label").prop("checked", true)
        chrome.storage.local.set({"season_label": "true"})
    }
    // 重新渲染顏色
    applyTheme($("#theme option:selected").val())
    // 把預設label上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
}
$("#reset_all").on("click", () => {
    reset_all()
})
// 開啟new bug頁
$("#create_bug").on("click", ()=> {
    $("button.add_label.selected").each(function() {
        let label = $(this).val()
        if(label == "Season") {label = "Loc_S" + $("#season_num").val()}
        jira_labels = jira_labels + label + (label != "" ? " " : "")
    })
    let username = $("#profile_username").val()
    let LNG = $("#multi_lng").is(":checked") ? "FIGS/RU/PL/AR/PTBR/MX/KO/ZHS/ZHT/JA" : $("#profile_lng option:selected").val()
    // 確認基本資料有填寫
    if(username == ""){
        alert("Please enter jira username in setting and Check if the loc language is correct!")
        return
    }
    let area = "Global", level_query = "&customfield_10306=30237&customfield_10360=10814", 
        priority_query = "&priority=11103", location = $("#location").val() != "" ? $("#location").val() : "Location"
    let fix_version = $("#fix_version").val().trim(), fix_version_id = {
        "CER_Season_2": "14004", "CER_Season_2.5": "26502", "CER_Season_3": "14006", "CER_Season_3.5": "26504", "CER_Season_4": "14008",
        "CER_Season_4.5": "26506", "CER_Season_5": "14010", "CER_Season_5.5": "26508", "CER_Season_6": "14012"
    }
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
    if($("#season_label").is(":checked")) {
        label_query = label_query + " &labels=Loc_S" + $("#season_num").val()
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
    let issue_type_1 = $(".issue_type_1.selected").text().replace("Loc_", "").toUpperCase()
    let issue_type_2 = $(".issue_type_2.selected").text().replace($(".issue_type_1.selected").text() + "_", "").replace("_", "/").toUpperCase()
                       
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
    "2%29 " + "%28%E2%81%A0%EF%BD%A5%E2%81%A0%CF%89%E2%81%A0%EF%BD%A5%E2%81%A0%29%E2%81%A0%E3%81%A4" + "%7B%2A%7D%7Bcolor%3A%23DE350B%7DInput steps here%21%7Bcolor%7D%7B%2A%7D" + "%E2%8A%82%E2%81%A0%28%E2%81%A0%EF%BD%A5%E2%81%A0%CF%89%E2%81%A0%EF%BD%A5%E2%81%A0%29" + "%0A" +
    "3%29%20Observe the issue%0A%0A" +
    "*BUG OBSERVED*%0A" +
    "----%0A" +
    summary_detail + ".%0A" + "%28%E2%81%A0%E4%BA%BA%E2%81%A0%2A%E2%81%A0%C2%B4%E2%81%A0%E2%88%80%E2%81%A0%EF%BD%80%E2%81%A0%29%E2%81%A0%EF%BD%A1%E2%81%A0%2A%EF%BE%9F%E2%81%A0%2B" + " %7B%2A%7D%7Bcolor%3A%23DE350B%7DAdd more details%21%7Bcolor%7D%7B%2A%7D" + "%E2%97%9D%E2%81%A0%28%E2%81%A0%E2%81%B0%E2%81%A0%E2%96%BF%E2%81%A0%E2%81%B0%E2%81%A0%29%E2%81%A0%E2%97%9C%E2%81%A0%0A" +
    "Please check the screenshot attached for further details.%0A%0A" +
    "*ACTION REQUIRED*%0A" +
    "----%0A" +
    action_required + "%20Thanks!%0A%0A" +
    "*RESOURCE%20ID*%0A" +
    "----%0A" + resource_ids + "%0A%0A%5C%5C%20" +
    "keywords%3A " + "%28%E2%81%A0%E2%97%8F%E2%81%A0%E2%80%99%E2%81%A03%E2%81%A0%29%E2%81%A0" + "%7B%2A%7D%7Bcolor%3A%23DE350B%7DAdd keywords%21%7Bcolor%7D%7B%2A%7D" + "%E2%81%A0%28%E2%81%A0%CE%B5%E2%81%A0%60%E2%81%A0%E2%97%8F%E2%81%A0%29" + "%0A"
    let branch_type = {
        "trunk": "31905", "release": "31907", "cert": "31908", "etu": "35601"
    }
    let branch_found_cl = $("#found_cl").val().trim().split("_")
    let branch = found_cl = ""
    if(branch_found_cl.length == 2) {
        branch = branch_type[branch_found_cl[0].toLowerCase()]
        found_cl = branch_found_cl[1]
    }else{
        found_cl = branch_found_cl[0]
    }
    let query_string_url = 
    "https://dev.activision.com/jira/secure/CreateIssueDetails!init.jspa?issuetype=10203&pid=10201&components=26600&fixVersions=" + fix_version_id[fix_version] + 
    "&customfield_10325=10443&customfield_10319=10416&customfield_10900=12800&reporter=" + username + "&customfield_10362=11096" + "&summary=" + summary + 
    "&description=" + description + "&assignee=" + username + "&customfield_10307=" + found_cl + "&customfield_10604=" + branch + priority_query + label_query + level_query + 
    "&reporter=" + username + atvi_type_query + loc_lng_query + loc_type_query + "&customfield_12303=" + resource_ids

    // 使用Query String在新分頁開啟Log Bug頁
    chrome.tabs.create({url: query_string_url})
    return false
})

//////////////////////
// File Naming page //
//////////////////////

// Regression Lock上鎖資訊和目前的release ID 上傳localstorage
current_release_id = ""
regression_lock = false
$('#regression_lock').on("click", function() {
    regression_lock = !regression_lock
    chrome.storage.local.set({"regression_lock": regression_lock})
    if(regression_lock){
        chrome.storage.local.set({"release_id": $("#release_id").val()})
        $('#regression_lock').removeClass("fa-lock-open").addClass("fa-lock")
    }else{
        $("#release_id").val(current_release_id)
        $('#regression_lock').removeClass("fa-lock").addClass("fa-lock-open")
    }
    // release id是否可輸入
    $("#release_id").prop("disabled", regression_lock)
    updateFileName()
})
// 取得localstorage上Regression Lock打勾資訊
chrome.storage.local.get("regression_lock").then((result) => {
    if(result["regression_lock"]){
        regression_lock = true
        $('#regression_lock').removeClass("fa-lock-open").addClass("fa-lock")
        // release id是否可輸入
        $("#release_id").prop("disabled", regression_lock)
    }
})

full_name_lang = ["EN", "FR", "IT", "DE", "ES", "RU", "PL", "AR", "ENAR", "PTBR", "MX", "KO", "ZHS", "ZHT", "JA", "TH"]
abbreviate_lang = {"E": "EN", "F": "FR", "I": "IT", "G": "DE", "S": "ES"}
// 取得jira上的bug資訊 填入file naming tab中 !!!同時也把bug number貼在Regression page
async function read_bug_data() {
    const bug_data = await chrome.runtime.sendMessage({type: "read_bug_data"});
    if(bug_data == null){
        console.log("Cannot get bug data from service_worker.js")
        $("#file_name").val("(⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠) _ (⁠◕⁠ᴗ⁠◕⁠✿⁠) _ ᕦ⁠(⁠ಠ⁠_⁠ಠ⁠)⁠ᕤ _ ლ⁠(⁠´⁠ ⁠❥⁠ ⁠`⁠ლ⁠) _ (⁠･ั⁠ω⁠･ั⁠)")
    }else{
        $("#current_bug").text("Currrent bug: " + bug_data.bug_id)
        $("#bug_id").val(bug_data.bug_id)
        $("#bug_type_1").val(bug_data.bug_type_1)
        $("#bug_type_2").val(bug_data.bug_type_2)
        $("#bug_lng_select").prop('disabled', false)
        $("#bug_lng_select").empty()
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
        if(!$("#regression_lock").hasClass("fa-lock-open")){
            await chrome.storage.local.get("release_id").then((result) => {
                if(result["release_id"] != undefined){
                    $("#release_id").val(result["release_id"])
                }
            })
        }else{
            $("#release_id").val(bug_data.release_id)
        }
        current_release_id = bug_data.release_id
        $("#file_name").val(($("#bug_id").val() + "_" + $("#bug_lng_select option:selected").text() + "_" + $("#bug_type_1").val() + "_" + $("#bug_type_2").val().replace("/", "_") + "_" + $("#release_id").val()).replace("__", "_"))
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
$("#file_name_copy").on("click", async () => {
    navigator.clipboard.writeText($("#file_name").val()).then(async () => {
        console.log('Async: Copying to clipboard was successful!');
        console.log($("#file_name_copy").text)
        $("#file_name_copy").removeClass("fa-copy")
        $("#file_name_copy").addClass("fa-check")
        await new Promise(r => setTimeout(r, 1000))
        $("#file_name_copy").removeClass("fa-check")
        $("#file_name_copy").addClass("fa-copy")
    }, function(err) {
        alert('Async: Could not copy text: ', err);
    });
})
// 按下_1, _2, _3...
$(".postfix").on("click", (event) => {
    let reg = new RegExp('_[0-9]$')
    let tag = $(event.target).text()
    let str = $("#file_name").val()
    if(reg.test(str)){
        if(str.substring(str.length - 2) == tag){
            $("#file_name").val(str.substring(0, str.length - 2))
            $(".postfix").removeClass("selected")
        }else{
            $("#file_name").val(str.substring(0, str.length - 2) + tag)
            $(".postfix").removeClass("selected")
            $(event.target).addClass("selected")
        }
    }else{
        $("#file_name").val(str + tag)
        $(event.target).addClass("selected")
    }
})

///////////////
// Xloc Page //
///////////////
let color_dict, color_codes = null
let emoji_dict, emoji_codes = null
let style_dict, style_codes = null

// 從color_code.json讀取資料
fetch("../data/color_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    color_dict = data
    color_codes = Object.keys(color_dict)
}).catch(err => {
    console.log("Error while fetching color_code.json: ", err)
})

// 從emoji_code.json讀取資料
fetch("../data/emoji_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    emoji_dict = data
    emoji_codes = Object.keys(emoji_dict)
}).catch(err => {
    console.log("Error while fetching emoji_code.json: ", err)
})

// 從style_code.json讀取資料
fetch("../data/style_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    style_dict = data
    style_codes = Object.keys(style_dict)
}).catch(err => {
    console.log("Error while fetching style_code.json: ", err)
})

// color code字串輸入監聽
$("#color_code_string").on("input", function() {
    convert_to_colored_string()
})
// color code淺色背景
$("#light-background").on("click", function(){
    $("#colored_string").css("background-color", "#fff")
})
$("#dark-background").on("click", function(){
    $("#colored_string").css("background-color", "#333333")
})

// 將color code轉成顏色
function convert_to_colored_string() {
    let color_code_string = $("#color_code_string").val()
    
    // 把style code逐一檢查
    let style_regex = style_codes.join("|").replaceAll("^", "\\^").replaceAll("?", "\\?").replaceAll(".", "\\.")
                      .replaceAll("$", "\\$").replaceAll("+", "\\+").replaceAll("#", "\\#")
    let buffer = [], release_buffer = false
    color_code_string.replace(new RegExp(style_regex, "g"), (element) => {
        let replace_element = "<span style = \"" + style_dict[element] + "\">"
        if(release_buffer) {
            while(buffer.length > 0){
                replace_element = buffer.pop() + replace_element
            }
            release_buffer = false
        }
        if(color_code_string.charAt(color_code_string.search(new RegExp(element.replaceAll("^", "\\^"), "g")) + element.length) != "^"){
            release_buffer = true
        }
        buffer.push("</span>")
        color_code_string = color_code_string.replace(element, replace_element)
    })    
    while(buffer.length > 0){// 把最後少加的</span>加回去
        color_code_string = color_code_string + buffer.pop()
    }
    // emoji code逐一檢查
    emoji_codes.map(function(element) {
        if(color_code_string.includes(element)) {
            console.log(element)
            console.log(emoji_dict[element])
            color_code_string = color_code_string.replaceAll(element, emoji_dict[element])
        }
    })
    $("#colored_string").empty()
    $("#colored_string").append(color_code_string)
    // 如果沒偵測到color code 提醒一下
    if(!color_codes.some(color_code => $("#color_code_string").val().includes(color_code)) && $("#color_code_string").val() != "") {
        $("#colored_string").append("<br><span style='color: red; font-weight: bolder;'>No Color code detected!</span>")
    }
}
$("#translation_contrast").on("click", () => {
    chrome.runtime.sendMessage({type: "highlight_translation_difference", value: true})
})

$("#toggle_highlight").on("click", () => {
    chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
})

////////////////////
// Setting Window //
////////////////////

let usernameRE = /\S+@\S+\.\S+/;
chrome.storage.local.get("theme").then((result) => {
    $("#" + result["theme"]).attr('selected','selected')
    // 初始化布景主題
    applyTheme($("#theme option:selected").val())
})
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
    $(".profile_username").removeClass("format-error")
})
$("#profile_username").on("focusout", function() {
    if(!usernameRE.test($("#profile_username").val()) && !$(".profile_username").hasClass("format-error")) {
        $(".profile_username").addClass("format-error")
        console.log("format error")
    }else if(usernameRE.test($("#profile_username").val()) && $(".profile_username").hasClass("format-error")) {
        $(".profile_username").removeClass("format-error")
        console.log("format correct")
    }
})
$("#theme").change(() => {
    chrome.storage.local.set({"theme": $("#theme option:selected").val()})
    applyTheme($("#theme option:selected").val())
})
$("#check_username").on("click", function() {
    chrome.tabs.create({url: "https://dev.activision.com/jira/secure/ViewProfile.jspa"})
    return false
})
$("#setting").on("click", function() {
    $("#setting_window").show()
    $("#mask").show()
})
$("#setting").hover(
    function() {
        $(this).addClass("fa-spin")
    }, function() {
        $(this).removeClass( "fa-spin" )
    }
)
$("#mask").on("click", function() {
    $("#setting_window").hide()
    $("#mask").hide()
})

let css_var = [
    "--general-background-color"
    , "--general-text-color"
    , "--tab-background-color"
    , "--decorate-text-color"
    , "--file-naming-label-color"
    , "--general-button-color"
    , "--general-button-selected-color"
    , "--general-button-border-color"
    , "--general-button-background-color"
    , "--general-button-selected-background-color"
    , "--tablinks-color"
    , "--tablinks-selected-background-color"
    , "--checkbox-fill-color"
]
// 應用佈景主題
function applyTheme(theme) {
    fetch("../data/theme_" + theme + ".json").then(response => {
        if(response.ok) {return response.json()}
    }).then(data => {
        for(key in data) {
            let tag = key.split("=>")[0]
            let style_name = key.split("=>")[1]
            let style = data[key]
            $(tag).css(style_name, style)
        }
    })
    // 彩蛋圖片切換
    $(".logo").hide()
    if(theme == "cerberus") {
        $("#" + theme + "_logo").show()
    }
}