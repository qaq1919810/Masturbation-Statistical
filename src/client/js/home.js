/**
 * 获取日期：1月14日 星期三
 */
function getFormattedDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return `${month}月${date}日 ${dayNames[now.getDay()]}`
}

/**
 * 获取时间段状态并处理性别称呼
 */
function getTimeState() {
    const hours = new Date().getHours()
    let state

    if (hours >= 6 && hours < 12) {
        state = '早上'
    } else if (hours >= 12 && hours < 14) {
        state = '中午'
    } else if (hours >= 14 && hours < 19) {
        state = '下午'
    } else if (hours >= 19 && hours < 24) {
        state = '晚上'
    } else {
        state = '凌晨'
    }

    // 软编码：男机长，女矿工
    const title = user.sex === 'man' ? '机长' : '矿工'
    return `${state}好！${title}`
}

/**
 * 同步页面 UI 状态（对应图片 1, 2, 3 逻辑）
 */
function syncPageDisplay() {
    const todayCount = user.getTodayCount()
    const weekCount = user.getWeekCount()
    const actionText = user.sex === 'man' ? '起飞' : '挖矿'

    // 1. 同步本周概览次数
    const weekCountEl = document.querySelector(".stat-box .stat-value")
    if (weekCountEl) {
        weekCountEl.innerHTML = `${weekCount} <span>次</span>`
    }

    // 2. 同步今日状态大卡片 (today-card) -> 对应图片 1
    const todayCard = document.querySelector(".today-card")
    const todayInfo = todayCard.querySelector(".status-info")
    if (todayCount > 0) {
        // 样式变为蓝色渐变，文字更新
        todayCard.style.background = "linear-gradient(135deg, #90caf9, #bbdefb)"
        todayCard.style.color = "#fff"
        todayInfo.innerHTML = `
            <h2>今日已${actionText} ${todayCount} 次 ✨</h2>
            <p>保持好心情~</p>
        `
    } else {
        // 恢复初始样式
        todayCard.style.background = "white"
        todayCard.style.color = "inherit"
        todayInfo.innerHTML = `
            <h2>今日还没${actionText}</h2>
            <p>别忘了爱自己哦</p>
        `
    }

    // 3. 同步健康贴士 (tips-card) -> 对应图片 2
    const tipsCard = document.querySelector(".tips-card")
    const tipsContent = tipsCard.querySelector(".tips-content")
    if (todayCount > 1) {
        // 次数过多变为粉紫色调
        tipsCard.style.background = "#f3e5f5"
        tipsCard.style.color = "#7b1fa2"
        tipsContent.textContent = `今天${actionText}有点多次啦，注意身体哦${user.sex === 'man' ? '机长' : '矿工'} ${user.sex === 'man' ? '✈️' : '⛏️'}`    } else {
        // 恢复正常绿色调
        tipsCard.style.background = "#edf8ee"
        tipsCard.style.color = "#558b2f"
        tipsContent.textContent = "节奏很健康！继续保持~ ✨"
    }

    // 4. 同步起飞/挖矿按钮 (action-btn) -> 对应图片 3
    const actionBtn = document.getElementById("action-btn")
    if (todayCount > 0) {
        // 已操作状态：背景变淡，文字改变
        actionBtn.style.background = "#f0f7ff"
        actionBtn.style.color = "#90caf9"
        actionBtn.style.boxShadow = "none"
        actionBtn.innerHTML = `<span>${user.sex === 'man' ? '🛫' : '⛏️'}</span> 又${actionText}了？`
    } else {
        // 初始状态
        actionBtn.style.background = "#90caf9"
        actionBtn.style.color = "white"
        actionBtn.innerHTML = `<span>${user.sex === 'man' ? '🛫' : '⛏️'}</span> ${actionText}`
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 权限检查
    if (!localStorage.getItem("AccountData")) {
        document.body.innerHTML = ""
        location.href = "../initData.html"
        return
    }

    // 初始同步 UI 数据
    syncPageDisplay()

    // 你原有的同步时间逻辑
    setTimeout(() => {
        document.getElementById("nowTimeShow").textContent = getFormattedDate()
        document.getElementById("nowTimeStateShow").textContent = `${getTimeState()} ☀️`
        console.log("当前时间:" + getFormattedDate())
        console.log("当前状态:" + getTimeState())
    }, 1000)

    // 起飞按钮绑定事件
    document.getElementById("action-btn").addEventListener("click", () => {
        // 1. 调用 UserData 实例的方法记录数据
        user.saveStatistics()

        // 2. 记录后立即同步 UI 状态
        syncPageDisplay()
    })
})