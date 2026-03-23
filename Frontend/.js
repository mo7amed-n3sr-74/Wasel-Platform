function numFormat(num, label) {
    switch(num) {
        case 1:
            return `${label[0]}`;
        case 2:
            return `${label[1]}`;
        default:
            return `${num} ${label[2]}`
    }
}

// console.log(numFormat(1, ["صورة", "صورتين", "صور"])); // صورة
// console.log(numFormat(2, ["صورة", "صورتين", "صور"])); // صورتين
// console.log(numFormat(3, ["صورة", "صورتين", "صور"])); // 3 صور

const label_1 = "mohamed.png"
const label_2 = "mohamed.nasr.awad.png"

// console.log(label_1.split(".").splice(label_1.split(".").length - 1, 1)[0]) // png
// console.log(label_1.split(".").slice(0, label_1.split(".").length - 1).join(".")) // mohamed.nasr