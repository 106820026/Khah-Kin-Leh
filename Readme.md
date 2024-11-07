>[!IMPORTANT]
>
>**We are currently in Beta Test**

# 2024-11-07
1. Rename **Label** tab to **New Bug** tab
2. Add safety issue label in New Bug tab
3. New Bug tab can generate a jira query string to create new bug
4. Add profile tab which can let user input their language and jira username
5. Remove fontawesome to reduce extension size
6. Remove Regression Tab
# 2024-11-05 🎂
1. Remove comment tab
2. Change Translation contrast highlight color to Light/Dark Green
3. Fix label typo and incorrect issue type
4. Add Text/Subtitle_Missing, Subtitle_Mismatch, Loc_Language, Loc_Cerberus and telescope specific labels
# 2024-11-04
1. Add translation contrast button in Xloc tab
2. If read_bug_data.js cannot read bug data, it will automatically retry in .5 second
3. Add **Loc_Text_Spelling_Grammer** label in label tab
4. Replace "/" to space in file name textarea
# 2024-10-25
1. When user click click Loc_Text or Loc_Subtitle or Loc_Audio, the corresponding tags will show up
2. Add "CLEAR Selected Tags" button
# 2024-10-22
1. Add Report Error link, which will redirect to Ivy's slack profile
2. Adjust pop up width (Enlarge)
# 2024-10-20
New evolution of the codes but the UI become more ugly :painsmile:
1. Stop keep calling content script every 1 sec, all action will be taken when the pop up window open
2. Add tag tab for adding tags when logging a bug
3. Add more color code, especially from Jupiter color code
4. Enlarge the File name text area in File Naming tab
5. Add more platform and LNG in Comment tab

## Note
local storage snapshot `chrome.storage.local.get(console.log)`  
clear local storage `chrome.storage.sync.clear()`
## Useful links
[Chrome for Developer](https://developer.chrome.com/)
## Meme
![](./data/m2.webp) ![](./data/Why.webp)