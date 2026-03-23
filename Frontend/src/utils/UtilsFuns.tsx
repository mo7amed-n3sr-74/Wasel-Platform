export function numFormat(num: number, label: string[]) {
    switch(num) {
        case 1:
            return `${label[0]}`;
        case 2:
            return `${label[1]}`;
        default:
            return `${num} ${label[2]}`
    }
}