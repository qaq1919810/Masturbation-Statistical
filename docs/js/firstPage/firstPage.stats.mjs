// noinspection JSUnresolvedReference

/**
 * 周统计图表同步函数 (支持响应式字体)
 */
function weekEchartSync() {
    const chartDom = document.getElementById("bar-chart")
    if (!chartDom) return

    let myChart = echarts.getInstanceByDom(chartDom)
    if (!myChart) {
        myChart = echarts.init(chartDom)
    }

    // --- 数据处理部分 (保持不变) ---
    const locale = new Intl.Locale(navigator.language)
    const firstDayOfWeek = locale.weekInfo ? locale.weekInfo.firstDay : 1
    const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    const dynamicLabels = []
    const counts = new Array(7).fill(0)

    for (let i = 0; i < 7; i++) {
        let dayNum = firstDayOfWeek + i
        if (dayNum > 7) dayNum -= 7
        dynamicLabels.push(dayNames[dayNum - 1])
    }

    user.getWeekStats().forEach(item => {
        const date = new Date(item.time)
        let day = date.getDay()
        if (day === 0) day = 7
        let index = day - firstDayOfWeek
        if (index < 0) index += 7
        counts[index]++
    })

    // --- ECharts 配置部分 ---
    const option = {
        grid: {
            top: "15%",
            left: "2%",
            right: "2%",
            bottom: "5%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: dynamicLabels,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: "#999",
                // 使用 vmin 设置底部文字大小，建议 3.5vmin 左右
                fontSize: vminToPx(3.5),
                margin: vminToPx(2.5),
                interval: 0
            }
        },
        yAxis: {
            type: "value",
            show: false
        },
        series: [{
            data: counts,
            type: "bar",
            // 柱子宽度也可以根据 vmin 动态微调
            barWidth: "40%",
            label: {
                show: true,
                position: "top",
                distance: vminToPx(1.5),
                color: "#90caf9",
                // 柱顶数字大小，建议 4vmin 左右
                fontSize: vminToPx(4),
                fontWeight: "bold",
                formatter: (p) => p.value === 0 ? "" : p.value
            },
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#90caf9" },
                    { offset: 1, color: "#bbdefb" }
                ]),
                borderRadius: [vminToPx(1), vminToPx(1), 0, 0] // 圆角也用 vmin
            }
        }]
    }

    myChart.setOption(option)

    // 解决渲染偏移：强制重绘
    setTimeout(() => {
        myChart.resize()
    }, 100)
}

function monthSheetSync() {
    const grid = document.querySelector(".calendar-grid")
    const monthLabel = document.querySelector(".cal-header span")
    if (!grid) return

    // 1. 基础时间数据
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const totalDays = new Date(year, month + 1, 0).getDate() // 本月总天数

    monthLabel.textContent = `${month + 1}月`

    // 2. 获取数据并统计每天的次数
    const monthStats = user.getMonthStats()
    const dayMap = new Map()
    monthStats.forEach(item => {
        const d = new Date(item.time).getDate()
        dayMap.set(d, (dayMap.get(d) || 0) + 1)
    })

    // 3. 计算 1 号的起始位置 (根据用户地区习惯)
    const locale = new Intl.Locale(navigator.language)
    const startOfWeek = locale.weekInfo ? locale.weekInfo.firstDay : 1 // 1:周一, 7:周日

    const firstDayDate = new Date(year, month, 1)
    let firstDayPos = firstDayDate.getDay() // 0(周日)-6(周六)
    if (firstDayPos === 0) firstDayPos = 7 // 统一为 1-7

    // 计算 1 号相对于起始日的偏移量（CSS Grid 的列索引从 1 开始）
    let startColumn = firstDayPos - (startOfWeek === 7 ? 0 : startOfWeek) + 1
    if (startColumn <= 0) startColumn += 7

    // 4. 清空并动态创建
    grid.innerHTML = "" // 彻底清空，不留空盒子

    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement("div")
        cell.className = "cal-day"

        // 关键：仅给 1 号设置起始列，后续格子会自动排队
        if (d === 1) {
            cell.style.gridColumnStart = String(startColumn)
        }

        // 填充内容
        const count = dayMap.get(d) || 0
        if (count > 0) {
            cell.classList.add("active-heart")
            cell.textContent = "❤️"
        }

        grid.appendChild(cell)
    }
}

function allViewSync() {
    // 1. 获取当前面板下的所有统计卡片
    const cards = document.querySelectorAll("#view-all .info-card")
    if (cards.length < 3) return

    // 2. 填入统计数据 (对应累计、连续、频率)
    cards[0].querySelector(".card-value").innerHTML = `${user.stats.length} <span>次</span>`

    // 连续天数逻辑 (此处需有 getMaxStreak 函数)
    const streak = getMaxStreak(user.stats)
    cards[1].querySelector(".card-value").innerHTML = `${streak} <span>天</span>`

    // 频率逻辑 (此处需有 getAvgFrequency 函数)
    const avg = getAvgFrequency(user.stats)
    cards[2].querySelector(".card-value").innerHTML = `${avg} <span>次/周</span>`

    // 3. 建议卡片同步
    const adviceContainer = document.getElementById("advice-container")
    if (!adviceContainer) return

    // 彻底清除行内样式
    adviceContainer.removeAttribute("style")
    const todayCount = user.getTodayStats().length

    // 核心判定：今日 > 1 即频繁
    if (todayCount > 1) {
        adviceContainer.className = "advice-card"
        adviceContainer.innerHTML = `
            <p class="tips-title">💡 近期建议</p>
            <p class="tips-content">最近有点频繁，要注意身体休息哦 🛌</p>
        `
    } else {
        adviceContainer.className = "tips-card"
        adviceContainer.innerHTML = `
            <p class="tips-title">💡 健康小贴士</p>
            <p class="tips-content">节奏很健康！继续保持~ ✨</p>
        `
    }
}

/**
 * 计算最长连续记录天数
 * @param {Array} stats - 统计记录数组
 * @returns {number} 最长连续天数
 */
function getMaxStreak(stats) {
    if (stats.length === 0) return 0

    // 获取所有记录的日期（去重）
    const dates = new Set()
    stats.forEach(item => {
        const date = new Date(item.time).toDateString()
        dates.add(date)
    })

    // 转换为排序的日期数组
    const sortedDates = Array.from(dates).map(dateStr => new Date(dateStr)).sort((a, b) => a - b)

    let maxStreak = 1
    let currentStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1]
        const currDate = sortedDates[i]

        // 检查是否连续（相差一天）
        const diffTime = currDate.getTime() - prevDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
            currentStreak++
            maxStreak = Math.max(maxStreak, currentStreak)
        } else {
            currentStreak = 1
        }
    }

    return maxStreak
}

/**
 * 计算平均每周频率
 * @param {Array} stats - 统计记录数组
 * @returns {string} 平均频率，格式为 x.x
 */
function getAvgFrequency(stats) {
    if (stats.length === 0) return "0.0"

    // 获取第一条记录的日期
    const firstDate = new Date(stats[0].time)
    const now = new Date()

    // 计算总周数（至少1周）
    const diffTime = now.getTime() - firstDate.getTime()
    const diffWeeks = Math.max(1, diffTime / (1000 * 60 * 60 * 24 * 7))

    // 总次数 / 周数
    const avg = stats.length / diffWeeks
    return avg.toFixed(1)
}
/**
 * 初始化统计页 Tab 切换
 */
export function initStatsTabs() {
    const tabs = document.querySelectorAll(".tab-item")
    const panels = document.querySelectorAll(".view-panel")
    const tabContainer = document.querySelector(".stats-tabs")

    if (!tabContainer || tabContainer.dataset.bound) return
    tabContainer.dataset.bound = "true"

    tabContainer.addEventListener("click", (e) => {
        const tab = e.target.closest(".tab-item")
        if (!tab) return

        tabs.forEach(t => t.classList.remove("active"))
        tab.classList.add("active")

        const targetViewId = `view-${tab.dataset.view}`
        panels.forEach(panel => {
            if (panel.id === targetViewId) {
                panel.classList.remove("hidden")
            } else {
                panel.classList.add("hidden")
            }
        })
    })
}

export function syncPageDisplay() {
    // 1. 更新大标题数值
    document.getElementById("big-number").textContent = String(user.getWeekStats().length)

    // 表更新
    weekEchartSync()
    monthSheetSync()
    allViewSync()
}