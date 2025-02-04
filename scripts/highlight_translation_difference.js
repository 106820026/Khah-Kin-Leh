contrast_strings = document.getElementsByClassName("ivy_add_translation_diff")
d_m_p = new diff_match_patch()
translation_col = 0, prev_translation_col = 0
table_head = document.querySelectorAll("table.rgMasterTable th")
table_data = document.querySelectorAll("table.rgMasterTable tbody td")
total_record = document.getElementById("ctl06_RadGrid1_ctl00_ctl02_ctl00_lblTotalsTop").innerHTML.split(":")[1]
total_col = table_head.length
table_head.forEach((col, i) => {
    if(col.textContent == "Translation") {
        translation_col = i
    }else if(col.textContent == "Previous Translation") {
        prev_translation_col = i
    }
})
// 若搜尋translation會有xloc自行highlight部分 需要去除
for(let i = 0; i < total_record; i++){
    table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").querySelectorAll("span").forEach(span => {
        table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").innerHTML = table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").textContent
    })
}
// 為了不取代到錯誤的字串 用point指出目前位置
translation_pointer = 0
prev_translation_pointer = 0
if(contrast_strings.length == 0){
    for(let i = 0; i < total_record; i++) {
        curr = table_data[total_col*i + translation_col].textContent.trim()
        prev = table_data[total_col*i + prev_translation_col].textContent.trim()
        d_m_p.diff_main(curr, prev).forEach(item => {
            replacement = "<span class=\"ivy_add_translation_diff\" style=\"background:LightGreen; color:DarkGreen\">" + item[1] + "</span>"
            if(item[0] === -1) {
                table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").innerHTML = table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").innerHTML.betterReplace(item[1], replacement, translation_pointer)
                translation_pointer = table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").innerHTML.indexOf(replacement, translation_pointer) + replacement.length
            }else if(item[0] === 1) {
                table_data[total_col*i + prev_translation_col].querySelector("div.xloc_FormatForHTML").innerHTML = table_data[total_col*i + prev_translation_col].querySelector("div.xloc_FormatForHTML").innerHTML.betterReplace(item[1], replacement, prev_translation_pointer)
                prev_translation_pointer = table_data[total_col*i + prev_translation_col].querySelector("div.xloc_FormatForHTML").innerHTML.indexOf(replacement, prev_translation_pointer) + replacement.length
            }
        })
        translation_pointer = 0
        prev_translation_pointer = 0
    }
}else {
      for(let i = 0; i < total_record; i++) {
          curr = table_data[total_col*i + translation_col].textContent.trim()
          prev = table_data[total_col*i + prev_translation_col].textContent.trim()
          d_m_p.diff_main(curr, prev).forEach(item => {
              replacement = "<span class=\"ivy_add_translation_diff\" style=\"background:LightGreen; color:DarkGreen\">" + item[1] + "</span>"
              if(item[0] === -1) {
                table_data[total_col*i + translation_col].innerHTML = table_data[total_col*i + translation_col].innerHTML.replace(replacement, item[1])
              }else if(item[0] === 1) {
                table_data[total_col*i + prev_translation_col].innerHTML = table_data[total_col*i + prev_translation_col].innerHTML.replace(replacement, item[1])
              }
          })
      }
}