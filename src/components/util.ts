export function CopyList(a: any[], b: any[]) {
    for(let i = 0; i < a.length; i++) {
        a[i] = b[i]
    }
}