import {timeShow, syncPageDisplay as homeSync} from "./firstPage/firstPage.home.mjs"
import {initStatsTabs, syncPageDisplay as statsSync} from "./firstPage/firstPage.stats.mjs"

/**
 * 工具函数
 */
function getFormattedDate() {
    const now = new Date()
    const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    return `${now.getMonth() + 1}月${now.getDate()}日 ${dayNames[now.getDay()]}`
}

function getTimeState() {
    const hours = new Date().getHours()
    const state = hours >= 6 && hours < 12 ? "早上" : hours >= 12 && hours < 19 ? "下午" : "晚上"
    const title = user.sex === "man" ? "机长" : "矿工"
    return `${state}好！${title}`
}

/**
 * 页面激活Action
 */
const pageActions = new Map([
    ["homePage", () => {
        timeShow(getFormattedDate, getTimeState)
        homeSync()
    }],
    ["statsPage", () => {
        initStatsTabs()
        statsSync()
    }]
])

function init() {
    // 检查信息是否存在
    if (!localStorage.getItem("AccountData")) {
        location.href = "../initData.html"
        return
    }

    const track = document.getElementById("slider-track")
    const nav = document.querySelector(".bottom-nav")
    const pages = document.querySelectorAll(".page-wrapper")

    // 1. 导航点击跳转
    nav.addEventListener("click", (e) => {
        const item = e.target.closest(".nav-item")
        if (!item) return
        const index = Array.from(nav.querySelectorAll(".nav-item")).indexOf(item)
        if (index !== -1) {
            track.style.scrollBehavior = "auto"
            track.scrollLeft = window.innerWidth * index
        }
    })

    // 2. 观察页面滑动触发刷新
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pageActions.get(entry.target.id)()
            }
        })
    }, {root: track, threshold: 0.6})

    pages.forEach(page => observer.observe(page))

    // 3. 业务按钮
    document.getElementById("action-btn").addEventListener("click", () => {
        user.saveStats()
        homeSync()
    })
}

init()