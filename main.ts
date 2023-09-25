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
}

class primesLine{
  // line上の各点のスパンを変えるには、spanを変えてください。
  static span = 50;
  elementsArr: number[];
  hash: {};

  constructor(arr: number[], isExpensive: boolean){
    this.elementsArr = arr;
    this.hash = this.makeGraphOfmoneyAndNumber(primesLine.span, isExpensive);
  }


  /**elementArrから価格帯別人数を出す関数 */
  makeGraphOfmoneyAndNumber(span: number, isExpensive: boolean) {
    // hashの作成
    let hash = {};
    const arrMax = Math.max(...this.elementsArr);

    for(let i = 0; i <= Math.ceil(arrMax/span); i++){
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


  /**他のprimesLineとの交点を出力する関数 */
  calculateCrossPoint(another: primesLine){
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

      // crossした場合は交点座標を計算する。
      if(hash1[key] == hash2[key] || highBefore !== highAfter ){



        console.log(key);
        break;
      }
  }
  }
}






// main
// dataの定義
const PSMrawdata =new csv("csv\\PSMrawdata.csv");

// [高い][安い][高すぎる][安すぎる]の、各値だけをまとめた配列
const expensive = new primesLine(PSMrawdata.makePriceArr(1), true);
const cheap = new primesLine(PSMrawdata.makePriceArr(2), false);
const tooExpensive = new primesLine(PSMrawdata.makePriceArr(3), true);
const tooCheap = new primesLine(PSMrawdata.makePriceArr(4), false);


console.log(expensive.hash)
console.log(cheap.hash)
console.log("---------")
console.log(expensive.calculateCrossPoint(cheap));

