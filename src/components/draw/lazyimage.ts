// 懒加载图片
export class LazyImage {
    url: string

    loading: boolean = false
    isLoad: boolean = false
    img: HTMLImageElement = new Image()

    constructor(url: string) {
        this.url = url
    }

    get() {
        if (this.isLoad) {          // 已加载
            return this.img
        } else if (this.loading) {  // 正在加载
            return null
        } else {                    // 加载
            this.loading = true
            this.img.src = this.url
            this.img.onload = () => {
                this.loading = false
                this.isLoad = true
            }
            return null
        }
    }
}