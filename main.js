"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// module
var fs_1 = require("fs");
var sync_1 = require("csv-parse/sync");
// class
var csv = /** @class */ (function () {
    function csv(relative_pass) {
        this.records = (0, sync_1.parse)((0, fs_1.readFileSync)("".concat(__dirname, "/").concat(relative_pass), {
            encoding: "utf8",
        }));
    }
    /** recordsからindex番目の値だけの配列を作る関数 */
    csv.prototype.makePriceArr = function (index) {
        var arr = [];
        for (var i = 1; i < this.records.length; i++) {
            arr.push(Number(this.records[i][index]));
        }
        return arr;
    };
    /**recordsの中からsampleNumberを除いた最大値を求める関数 */
    csv.prototype.findMaxValue = function () {
        var max = Number(this.records[1][1]);
        for (var i = 1; i < this.records.length; i++) {
            var record = this.records[i];
            for (var j = 1; j < 5; j++) {
                var curr = Number(record[j]);
                if (max < curr)
                    max = curr;
            }
        }
        return max;
    };
    return csv;
}());
var point = /** @class */ (function () {
    function point(x, y) {
        this.x = x;
        this.y = y;
    }
    return point;
}());
var line_segment = /** @class */ (function () {
    function line_segment(start, end) {
        this.start = start;
        this.end = end;
    }
    /**この線分の傾きを計算する関数 */
    line_segment.prototype.caluculateSlope = function () {
        return (this.start.y - this.end.y) / (this.start.x - this.end.x);
    };
    /**この線分の切片を計算する関数 */
    line_segment.prototype.caluculateIntercept = function () {
        var a = this.caluculateSlope();
        return this.start.y - a * this.start.x;
    };
    /**他のline_segmentを受け取り交点を[x, y]で出力する関数 */
    line_segment.prototype.caluculateCrossPoint = function (another) {
        var a1 = this.caluculateSlope();
        var b1 = this.caluculateIntercept();
        var a2 = another.caluculateSlope();
        var b2 = another.caluculateIntercept();
        var x = (b2 - b1) / (a1 - a2);
        var y = a1 * x + b1;
        return [x, y];
    };
    return line_segment;
}());
var primesLine = /** @class */ (function () {
    // elementArrは例えば、「高い」の価格だけが格納されている配列
    // hashは、価格帯別の合計人数をそれぞれ格納するhashmap
    function primesLine(arr, maxOfAll, isExpensive) {
        this.elementsArr = arr;
        this.maxofAll = maxOfAll;
        this.hash = this.makeGraphOfmoneyAndNumber(primesLine.span, isExpensive);
    }
    /**elementArrから価格帯別人数を格納した、hashmapを作る関数 */
    primesLine.prototype.makeGraphOfmoneyAndNumber = function (span, isExpensive) {
        // 空hashの作成
        var hash = {};
        for (var i = 0; i <= Math.ceil(this.maxofAll / span); i++) {
            var curr = i * span;
            hash[curr] = 0;
        }
        // hashに値を追加していく
        for (var i = 0; i < this.elementsArr.length; i++) {
            var curr = this.elementsArr[i]; // 100
            // isExpensiveがtrueの場合は、curr以上は全ての値段で高いと感じるので、カウントしておけばいい。
            if (isExpensive) {
                for (var key in hash) {
                    var currKey = Number(key); // 50, 100, 150, ...
                    if (curr <= currKey)
                        hash[key] += 1;
                }
            }
            else {
                for (var key in hash) {
                    var currKey = Number(key); // 50, 100, 150, ...
                    if (curr >= currKey)
                        hash[key] += 1;
                }
            }
        }
        return hash;
    };
    /**他のprimesLineとの交点から、理想価格を出力する関数 */
    primesLine.prototype.calculatePrimesLineCross = function (another) {
        var hash1 = this.hash;
        var hash2 = another.hash;
        var key1 = Object.keys(hash1);
        var key2 = Object.keys(hash2);
        var main = (key1.length <= key2.length) ? hash1 : hash2;
        // key(金額軸)を順に走査していき、対応するhash1とhash2の2つの値の上下関係を見る。
        for (var key in main) {
            var nextKey = (Number(key) + primesLine.span).toString();
            var highBefore = (hash1[key] > hash2[key]) ? 1 : 2;
            var highAfter = (hash1[nextKey] > hash2[nextKey]) ? 1 : 2;
            if (hash1[key] == hash2[key] || highBefore !== highAfter) {
                // crossした場合の計算内容
                var x1 = Number(key);
                var x2 = Number(key) + primesLine.span;
                var line1 = new line_segment(new point(x1, hash1[key]), new point(x2, hash1[nextKey]));
                var line2 = new line_segment(new point(x1, hash2[key]), new point(x2, hash2[nextKey]));
                return Math.ceil(line1.caluculateCrossPoint(line2)[0]);
            }
        }
    };
    // line上の各点のスパンを変えるには、spanを変えてください。
    primesLine.span = 50;
    return primesLine;
}());
// main
// dataの定義
var PSMrawdata = new csv("csv\\PSMrawdata.csv");
var max = PSMrawdata.findMaxValue();
// [高い][安い][高すぎる][安すぎる]の、各値だけをまとめた配列
var expensive = new primesLine(PSMrawdata.makePriceArr(1), max, true);
var cheap = new primesLine(PSMrawdata.makePriceArr(2), max, false);
var tooExpensive = new primesLine(PSMrawdata.makePriceArr(3), max, true);
var tooCheap = new primesLine(PSMrawdata.makePriceArr(4), max, false);
// 出力
console.log("出力結果");
console.log("\u6700\u9AD8\u4FA1\u683C\uFF1A".concat(tooExpensive.calculatePrimesLineCross(cheap), "\u5186"));
console.log("\u59A5\u5354\u4FA1\u683C\uFF1A".concat(tooExpensive.calculatePrimesLineCross(tooCheap), "\u5186"));
console.log("\u7406\u60F3\u4FA1\u683C\uFF1A".concat(expensive.calculatePrimesLineCross(cheap), "\u5186"));
console.log("\u6700\u4F4E\u54C1\u8CEA\u4FDD\u8A3C\u4FA1\u683C\uFF1A".concat(expensive.calculatePrimesLineCross(tooCheap), "\u5186"));
// テストケース
// const line1 = new line_segment(new point(0,0), new point(10, 10));
// const line2 = new line_segment(new point(0,10), new point(10, 0));
// console.log(line1.caluculateCrossPoint(line2));
// console.log(expensive.hash)
// console.log(cheap.hash)
// console.log("---------")
// console.log(expensive.calculateCrossPoint(cheap));
