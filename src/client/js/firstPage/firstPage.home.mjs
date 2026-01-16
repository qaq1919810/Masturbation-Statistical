let timer = null

/**
 * 启动并维持时间更新
 * 如果 timer 已存在则直接退出，确保全局只有一个定时器在运行
 */
export function timeShow(getFormattedDate, getTimeState) {
    // 如果定时器已在运行，直接返回，不新建
    if (timer) return

    // 定义内部循环逻辑
    const runUpdate = () => {
        const timeShowEl = document.getElementById("nowTimeShow")
        const stateShowEl = document.getElementById("nowTimeStateShow")

        // 只有在 DOM 存在时才更新（防止在其他页面报错）
        if (timeShowEl) timeShowEl.textContent = getFormattedDate()
        if (stateShowEl) stateShowEl.textContent = `${getTimeState()} ☀️`

        timer = setTimeout(runUpdate, 1000)
    }

    // 第一次启动
    runUpdate()
}

/**
 * 同步首页 UI 状态
 */
/**
 * 页面显示同步函数
 * 负责第一页（主页）的 UI 更新
 */
export function syncPageDisplay() {
    // 1. 获取核心统计数据
    const todayStats = window.user.getTodayStats()
    const weekStats = window.user.getWeekStats()
    const todayCount = todayStats.length
    const weekCount = weekStats.length
    const actionText = window.user.sex === "man" ? "起飞" : "挖矿"

    // 2. 同步本周概览数字
    const weekCountEl = document.querySelector(".stat-box .stat-value")
    if (weekCountEl) weekCountEl.innerHTML = `${weekCount} <span>次</span>`

    // 3. 今日状态卡片渲染 (today-card)
    const todayCard = document.querySelector(".today-card")
    if (todayCard) {
        const todayInfo = todayCard.querySelector(".status-info")
        // 清除之前可能残余的行内背景
        todayCard.removeAttribute("style")

        if (todayCount > 0) {
            // 已操作状态：应用渐变蓝色背景
            todayCard.style.background = "linear-gradient(135deg, #90caf9, #bbdefb)"
            todayCard.style.color = "#fff"
            todayInfo.innerHTML = `<h2>今日已${actionText} ${todayCount} 次 ✨</h2><p>保持好心情~</p>`
        } else {
            // 未操作状态：恢复白色背景
            todayCard.style.background = "white"
            todayCard.style.color = "inherit"
            todayInfo.innerHTML = `<h2>今日还没${actionText}</h2><p>别忘了爱自己哦</p>`
        }
    }

    // 4. 操作按钮状态同步 (action-btn)
    const actionBtn = document.getElementById("action-btn")
    if (actionBtn) {
        actionBtn.removeAttribute("style")
        const icon = window.user.sex === "man" ? "🛫" : "⛏️"

        if (todayCount > 0) {
            // 今日已有记录：按钮变浅色
            actionBtn.style.background = "#f0f7ff"
            actionBtn.style.color = "#90caf9"
            actionBtn.innerHTML = `<span>${icon}</span> 又${actionText}了？`
        } else {
            // 今日无记录：按钮为标准蓝色
            actionBtn.style.background = "#90caf9"
            actionBtn.style.color = "white"
            actionBtn.innerHTML = `<span>${icon}</span> ${actionText}`
        }
    }

    // 5. 动态健康建议卡片 (核心逻辑：仅看当日频率)
    const adviceContainer = document.getElementById("advice-container-home")
    if (adviceContainer) {
        // 关键：彻底清除行内样式，让 CSS 类名定义生效
        adviceContainer.removeAttribute("style")

        // 判定标准：只要今日超过 1 次（即 2 次及以上）
        if (todayCount > 1) {
            // 切换为红色警告类
            adviceContainer.className = "advice-card"
            adviceContainer.innerHTML = `
                <p class="tips-title">💡 近期建议</p>
                <p class="tips-content">最近有点频繁，要注意身体休息哦 🛌</p>
            `
        } else {
            // 切换为绿色健康类
            adviceContainer.className = "tips-card"
            adviceContainer.innerHTML = `
                <p class="tips-title">💡 健康小贴士</p>
                <p class="tips-content">节奏很健康！继续保持~ ✨</p>
            `
        }
    }
}