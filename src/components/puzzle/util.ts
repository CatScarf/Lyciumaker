// 下载Json
export function downloadJson(fileName: string, jsonStr: string) {
    const A = document.createElement('a')
    A.download = fileName
    A.style.display = 'none'

    const blob = new Blob([jsonStr])
    A.href = URL.createObjectURL(blob)
    document.body.appendChild(A)
    A.click()
    document.body.removeChild(A)
}