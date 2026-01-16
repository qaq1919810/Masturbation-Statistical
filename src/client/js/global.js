// noinspection JSUnresolvedReference

/**
 * 数据示例
 * {"age":number,"sex":string,"stats":arr}
 */
class UserData {
    constructor() {
        const raw = localStorage.getItem("AccountData")
        this.data = raw ? JSON.parse(raw) : {age: 0, sex: "man", stats: []}
    }

    /** @returns {Object} */
    get info() {
        return this.data
    }

    /** @returns {number} */
    get age() {
        return this.data.age
    }

    /** @returns {string} */
    get sex() {
        return this.data.sex
    }

    /** @returns {{time: string, id: number}[]} */
    get stats() {
        return this.data.stats
    }

    /** @param {Object} newData */
    save(newData) {
        this.data = newData
        localStorage.setItem("AccountData", JSON.stringify(this.data))
        console.log("数据已同步至磁盘")
    }

    /** 追加当前时间到统计记录 */
    saveStats() {
        const list = this.data.stats
        const nextId = list.length > 0 ? list[list.length - 1].id + 1 : 1
        const newItem = {
            time: new Date().toISOString(),
            id: nextId
        }
        list.push(newItem)
        localStorage.setItem("AccountData", JSON.stringify(this.data))
        console.log("已自动追加统计记录：", newItem)
    }

    /**
     * @private
     * @param {number} startTime
     * @returns {{time: string, id: number}[]}
     */
    #getStatsFromTimestamp(startTime) {
        const list = this.data.stats
        let index = -1
        for (let i = list.length - 1; i >= 0; i--) {
            if (new Date(list[i].time).getTime() < startTime) {
                index = i
                break
            }
        }
        return list.slice(index + 1)
    }

    /** * 获取今天凌晨至今的记录
     * @returns {{time: string, id: number}[]}
     */
    getTodayStats() {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        return this.#getStatsFromTimestamp(todayStart)
    }

    /** * 获取本周记录
     * @returns {{time: string, id: number}[]}
     */
    getWeekStats() {
        const locale = new Intl.Locale(navigator.language)
        const firstDayOfWeek = locale.weekInfo ? locale.weekInfo.firstDay : 1
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const dayOfWeek = today.getDay()
        const currentDay = dayOfWeek === 0 ? 7 : dayOfWeek
        let diff = firstDayOfWeek === 1 ? currentDay - 1 : dayOfWeek

        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - diff)
        return this.#getStatsFromTimestamp(startOfWeek.getTime())
    }

    /** * 获取指定月份记录
     * @param {number|string} [year] - 不传默认为当前年
     * @param {number|string} [month] - 不传默认为当前月
     * @returns {{time: string, id: number}[]}
     */
    getMonthStats(year, month) {
        let targetYear, targetMonth
        if (arguments.length === 0) {
            const now = new Date()
            targetYear = now.getFullYear()
            targetMonth = now.getMonth() + 1
        } else {
            targetYear = parseInt(year)
            targetMonth = parseInt(month)
            if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) return []
        }
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1).getTime()
        return this.#getStatsFromTimestamp(startOfMonth)
    }

    /** * 获取指定年份记录
     * @param {number|string} [year] - 不传默认为当前年
     * @returns {{time: string, id: number}[]}
     */
    getYearStats(year) {
        let targetYear = arguments.length === 0 ? new Date().getFullYear() : parseInt(year)
        if (isNaN(targetYear)) return []
        const startOfYear = new Date(targetYear, 0, 1).getTime()
        return this.#getStatsFromTimestamp(startOfYear)
    }

    /** * 获取过去 N 天内的记录
     * @param {number|string} days - 天数（支持小数）
     * @returns {{time: string, id: number}[]}
     */
    getToThisDayStats(days) {
        const numDays = parseFloat(days)
        if (isNaN(numDays)) return []
        const startTime = new Date().getTime() - (numDays * 24 * 60 * 60 * 1000)
        return this.#getStatsFromTimestamp(startTime)
    }
}

window.user = new UserData()
window.vminToPx = (vmin) => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const minSide = Math.min(windowWidth, windowHeight)
    return (vmin * minSide) / 100
}