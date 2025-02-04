function detect_highlight() {
    colored_strings = document.getElementsByClassName("ivy_add_color_code")
    contrast_strings = document.getElementsByClassName("ivy_add_translation_diff")
    let result = {
        "highlight_color_code": colored_strings.length > 0,
        "compare_translation": contrast_strings.length > 0
    }
    return result    
}

detect_highlight()
