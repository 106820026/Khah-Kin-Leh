// 等個幾秒(default 2 sec)
async function waitASecond(ms = 2000) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
