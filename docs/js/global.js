// noinspection JSUnresolvedReference

class UserData {
    constructor() {
        // 初始加载：仅在实例化时读一次磁盘
        const raw = localStorage.getItem("AccountData")
        this.data = raw ? JSON.parse(raw) : { age: 0, sex: "man", statistics: [] }
    }

    // 1. 获取所有信息（从内存读）
    get info() {
        return this.data
    }

    // 2. 获取年龄（从内存读）
    get age() {
        return this.data.age
    }

    // 3. 获取性别（从内存读）
    get sex() {
        return this.data.sex
    }

    // 4. 全量保存方法
    save(newData) {
        // 同步内存
        this.data = newData
        // 同步磁盘
        localStorage.setItem("AccountData", JSON.stringify(this.data))
        console.log("数据已同步至磁盘")
    }

    // 5. 追加统计数据
    saveStatistics() {
        const list = this.data.statistics
        const nextId = list.length > 0 ? list[list.length - 1].id + 1 : 1
        const nowTime = new Date().toISOString()

        const newItem = {
            time: nowTime,
            id: nextId
        }
        list.push(newItem)

        localStorage.setItem("AccountData", JSON.stringify(this.data))
        console.log("已自动追加统计记录：", newItem)
    }

    // --- 私有辅助方法：从后向前遍历统计符合时间戳范围的次数 ---
    _countFromTimestamp(startTime) {
        const list = this.data.statistics
        let count = 0
        // 从后往前检查，性能最优：遇到早于范围的数据立即停止
        for (let i = list.length - 1; i >= 0; i--) {
            const recordTime = new Date(list[i].time).getTime()
            if (recordTime >= startTime) {
                count++
            } else {
                break
            }
        }
        return count
    }

    // 6. 获取今天凌晨至今的次数
    getTodayCount() {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        return this._countFromTimestamp(todayStart)
    }

    // 7. 获取本周次数（自动识别地区周习惯 1-7 或 7-6）
    getWeekCount() {
        const locale = new Intl.Locale(navigator.language)
        // 1 代表周一，7 代表周日
        const firstDayOfWeek = locale.weekInfo ? locale.weekInfo.firstDay : 1

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const dayOfWeek = today.getDay() // 0(周日) 到 6(周六)

        // 统一偏移逻辑
        const currentDay = dayOfWeek === 0 ? 7 : dayOfWeek
        let diff = firstDayOfWeek === 1 ? currentDay - 1 : dayOfWeek

        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - diff)
        return this._countFromTimestamp(startOfWeek.getTime())
    }

    // 8. 获取月份次数 (0个参数:本月; 2个参数:指定年,月)
    getMonthCount(year, month) {
        let targetYear, targetMonth
        const argLen = arguments.length

        if (argLen === 0) {
            const now = new Date()
            targetYear = now.getFullYear()
            targetMonth = now.getMonth() + 1
        } else if (argLen === 2) {
            targetYear = parseInt(year)
            targetMonth = parseInt(month)
            if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) return "error"
        } else {
            return "error"
        }

        const startOfMonth = new Date(targetYear, targetMonth - 1, 1).getTime()
        return this._countFromTimestamp(startOfMonth)
    }

    // 9. 获取年份次数 (0个参数:本年; 1个参数:指定年)
    getYearCount(year) {
        let targetYear
        const argLen = arguments.length

        if (argLen === 0) {
            targetYear = new Date().getFullYear()
        } else if (argLen === 1) {
            targetYear = parseInt(year)
            if (isNaN(targetYear)) return "error"
        } else {
            return "error"
        }

        const startOfYear = new Date(targetYear, 0, 1).getTime()
        return this._countFromTimestamp(startOfYear)
    }

    // 10. 获取过去 N 天内的总次数（days 为数字，支持小数）
    getToThisDayCount(days) {
        const numDays = parseFloat(days)
        if (isNaN(numDays)) return 0
        // 当前时间戳减去 N 天的毫秒数
        const startTime = new Date().getTime() - (numDays * 24 * 60 * 60 * 1000)
        return this._countFromTimestamp(startTime)
    }
}
const user = new UserData()
