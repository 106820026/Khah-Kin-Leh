color_code_strings = document.getElementsByClassName("xloc_FormatForHTML")
colored_strings = document.getElementsByClassName("ivy_add")

// 從color_code.json讀取資料
if(color_code_strings.length > 0) {
    if(colored_strings.length == 0) {
        chrome.runtime.sendMessage({type: "read_color_code"}, function() {
            chrome.runtime.sendMessage({type: "get_color_code"}, function(color_dict) {
                let color_codes = Object.keys(color_dict)
                for(str_dom of color_code_strings) {
                    for(element of color_codes){
                        if(str_dom.innerHTML.includes(element)) {
                            str_dom.innerHTML = str_dom.innerHTML.replaceAll(element, "<span class=\"ivy_add\" style=\"background-color: " + color_dict[element] + "; color: black\">" + element + "</span>")
                        }
                    }
                }
            })
        })
    }else{
        chrome.runtime.sendMessage({type: "read_color_code"}, function() {
            chrome.runtime.sendMessage({type: "get_color_code"}, function(color_dict) {
                let color_codes = Object.keys(color_dict)
                for(str_dom of color_code_strings) {
                    for(element of color_codes){
                        if(str_dom.innerHTML.includes(element)) {
                            str_dom.innerHTML = str_dom.innerHTML.replaceAll("<span class=\"ivy_add\" style=\"background-color: " + color_dict[element] + "; color: black\">" + element + "</span>", element)
                            console.log(str_dom.innerHTML)
                        }
                    }
                }
            })
        })
    }
}

