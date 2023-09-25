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
    return csv;
}());
var primesLine = /** @class */ (function () {
    function primesLine(arr, isExpensive) {
        this.elementsArr = arr;
        this.hash = this.makeGraphOfmoneyAndNumber(primesLine.span, isExpensive);
    }
    /**elementArrから価格帯別人数を出す関数 */
    primesLine.prototype.makeGraphOfmoneyAndNumber = function (span, isExpensive) {
        // hashの作成
        var hash = {};
        var arrMax = Math.max.apply(Math, this.elementsArr);
        for (var i = 0; i <= Math.ceil(arrMax / span); i++) {
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
    /**他のprimesLineとの交点を出力する関数 */
    primesLine.prototype.calculateCrossPoint = function (another) {
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
            // crossした場合は交点座標を計算する。
            if (hash1[key] == hash2[key] || highBefore !== highAfter) {
                console.log(key);
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
// [高い][安い][高すぎる][安すぎる]の、各値だけをまとめた配列
var expensive = new primesLine(PSMrawdata.makePriceArr(1), true);
var cheap = new primesLine(PSMrawdata.makePriceArr(2), false);
var tooExpensive = new primesLine(PSMrawdata.makePriceArr(3), true);
var tooCheap = new primesLine(PSMrawdata.makePriceArr(4), false);
console.log(expensive.hash);
console.log(cheap.hash);
console.log("---------");
console.log(expensive.calculateCrossPoint(cheap));
