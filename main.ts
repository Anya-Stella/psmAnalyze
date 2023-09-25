// module
import { readFileSync } from "fs";
import { parse } from 'csv-parse/sync';

// class
class csv {
  records: number[];

  constructor(relative_pass: string) {
    this.records = parse(
      readFileSync(`${__dirname}/${ relative_pass }`, {
      encoding: "utf8",
    }));
  }


  /** recordsからindex番目の値だけの配列を作る関数 */
  makePriceArr (index: number): number[] {
    let arr: number[] = [];

    for(let i = 1; i < this.records.length; i++){
      arr.push(Number(this.records[i][index]));
    }
    return arr;
  }

  /**recordsの中からsampleNumberを除いた最大値を求める関数 */
  findMaxValue(){
    let max: number  = Number(this.records[1][1]);

    for(let i = 1; i < this.records.length; i++){
      let record = this.records[i];

      for(let j = 1; j < 5; j++){
        let curr = Number(record[j]);
        if( max < curr ) max = curr;
      }
    }

    return max;
  }
}

class point{
  x: number;
  y: number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y
  }
}

class line_segment{
  start: point;
  end: point;

  constructor(start: point, end: point){
    this.start = start;
    this.end = end;
  }

  /**この線分の傾きを計算する関数 */
  caluculateSlope(){
    return (this.start.y - this.end.y) / (this.start.x - this.end.x);
  }

  /**この線分の切片を計算する関数 */
  caluculateIntercept(){
    const a = this.caluculateSlope();

    return this.start.y - a*this.start.x;
  }

  /**他のline_segmentを受け取り交点を[x, y]で出力する関数 */
  caluculateCrossPoint(another: line_segment){
    // 2直線が平行の場合はendを採用する。
    // ex)(new point(291,2), new point(294, 2))と(new point(291,2), new point(294, 2));
    // psm分析では、a1 == a2になるのはa1=a2=0の時のみ
    const a1 = this.caluculateSlope();
    const b1 = this.caluculateIntercept();
    const a2 = another.caluculateSlope();
    const b2 = another.caluculateIntercept();
    if(a1 == a2) return [this.end.x, this.end.y];

    let x = (b2 - b1)/(a1 - a2);
    let y = a1 * x + b1;
    return [x, y];
  }
}

class primesLine{
  // line上の各点のスパンを変えるには、spanを変えてください。
  static span = 1;
  elementsArr: number[];
  hash: {};
  maxofAll: number;

  // elementArrは例えば、「高い」の価格だけが格納されている配列
  // hashは、価格帯別の合計人数をそれぞれ格納するhashmap
  constructor(arr: number[], maxOfAll: number, isExpensive: boolean){
    this.elementsArr = arr;
    this.maxofAll = maxOfAll;
    this.hash = this.makeGraphOfmoneyAndNumber(primesLine.span, isExpensive);
  }


  /**elementArrから価格帯別人数を格納した、hashmapを作る関数 */
  makeGraphOfmoneyAndNumber(span: number, isExpensive: boolean) {
    // 空hashの作成
    let hash = {};

    for(let i = 0; i <= Math.ceil(this.maxofAll/span); i++){
      let curr = i*span
      hash[curr] = 0;
    }

    // hashに値を追加していく
    for(let i = 0; i < this.elementsArr.length; i++){
      let curr = this.elementsArr[i];// 100

      // isExpensiveがtrueの場合は、curr以上は全ての値段で高いと感じるので、カウントしておけばいい。
      if(isExpensive){
        for(let key in hash){
          let currKey = Number(key);// 50, 100, 150, ...
          if( curr <= currKey ) hash[key] += 1;
        }
      }
      else {
        for(let key in hash){
          let currKey = Number(key);// 50, 100, 150, ...
          if( curr >= currKey ) hash[key] += 1;
        }
      }
    }

    return hash
  }


  /**他のprimesLineとの交点から、理想価格を出力する関数 */
  calculatePrimesLineCross(another: primesLine){
    const hash1 = this.hash;
    const hash2 = another.hash;
    const key1 = Object.keys(hash1);
    const key2 = Object.keys(hash2);

    const main = (key1.length <= key2.length) ? hash1 : hash2;

    // key(金額軸)を順に走査していき、対応するhash1とhash2の2つの値の上下関係を見る。
    for(let key in main){
      let nextKey = (Number(key) + primesLine.span).toString();
      let highBefore = (hash1[key] > hash2[key]) ? 1 : 2;
      let highAfter = (hash1[nextKey] > hash2[nextKey]) ? 1 : 2;

      if(hash1[key] == hash2[key] || highBefore !== highAfter ){
        // crossした場合の計算内容

        const x1 = Number(key);
        const x2 = Number(key) + primesLine.span;
        const line1 = new line_segment(new point(x1, hash1[key]), new point(x2, hash1[nextKey]));
        const line2 = new line_segment(new point(x1, hash2[key]), new point(x2, hash2[nextKey]));

        return Math.ceil(line1.caluculateCrossPoint(line2)[0]);
      }
  }
  }
}




// main
// dataの定義
const PSMrawdata =new csv("csv\\PSMrawdata.csv");
const max = PSMrawdata.findMaxValue();

// [高い][安い][高すぎる][安すぎる]の、各値だけをまとめた配列
const expensive = new primesLine(PSMrawdata.makePriceArr(1), max, true);
const cheap = new primesLine(PSMrawdata.makePriceArr(2), max, false);
const tooExpensive = new primesLine(PSMrawdata.makePriceArr(3), max, true);
const tooCheap = new primesLine(PSMrawdata.makePriceArr(4), max, false);

// 出力
console.log("出力結果");
console.log(`最高価格：${ tooExpensive.calculatePrimesLineCross(cheap) }円`)
console.log(`妥協価格：${ tooExpensive.calculatePrimesLineCross(tooCheap) }円`)
console.log(`理想価格：${ expensive.calculatePrimesLineCross(cheap) }円`)
console.log(`最低品質保証価格：${ expensive.calculatePrimesLineCross(tooCheap) }円`)


// テストケース
// const line1 = new line_segment(new point(0,0), new point(10, 10));
// const line2 = new line_segment(new point(0,10), new point(10, 0));
// const line3 = new line_segment(new point(0,0), new point(0, 100));
// const line4 = new line_segment(new point(0,100), new point(100, 0));
// const line5 = new line_segment(new point(250, 50), new point(300, 100));
// const line6 = new line_segment(new point(250, 50), new point(300, 0));
// console.log(line1.caluculateCrossPoint(line2));//(5,5)ok
// console.log(line2.caluculateCrossPoint(line1));//(5,5)ok
// // console.log(line3.caluculateCrossPoint(line4));//(0,100)// 今回は、line上でx1とx2が被ることはない
// // console.log(line4.caluculateCrossPoint(line3));//(0,100)
// console.log(line5.caluculateCrossPoint(line6));// (250, 50)ok
// console.log(line6.caluculateCrossPoint(line5));// (250, 50)ok
// console.log("--------------------------------")
// console.log(expensive.hash);
// console.log(tooExpensive.hash);
// console.log(cheap.hash);
// console.log(tooCheap.hash);
// console.log("---------------------------------")
// span = 50
// console.log(`最高価格：${ tooExpensive.calculatePrimesLineCross(cheap) }円`)// ok
// console.log(`妥協価格：${ tooExpensive.calculatePrimesLineCross(tooCheap) }円`)// ok
// console.log(`理想価格：${ expensive.calculatePrimesLineCross(cheap) }円`)// ok
// console.log(`最低品質保証価格：${ expensive.calculatePrimesLineCross(tooCheap) }円`)// ok
// console.log("----------------------------------");
// span = 5 ok
// span = 3の時価格にNaN
// 追加テストケース
// const line7 = new line_segment(new point(291,2), new point(294, 2));
// const line8 = new line_segment(new point(291,2), new point(294, 2));//(294,2)
// console.log(line7.caluculateCrossPoint(line8));
