function getData() {
  var valueMap = new Map();

  var parseTableRow = function(trElem) {
    var header = trElem.querySelector("th").textContent
    var value = trElem.querySelector("td").textContent
    //console.log(header + ":" + value)
    valueMap.set(header, value)
  };

  var parseTableRowAsYen = function(trElem) {
    try {
      var header = trElem.querySelector("th").textContent
      var value = trElem.querySelector("td").textContent // 1,230円00銭
      var fs = parseValueAsYen(value);
      //console.log(header + ":" + fs)
      valueMap.set(header, fs)
    } catch (err) {
      console.log("parseTableRowAsYen失敗: trElem:" + trElem + " err:" + err);
      console.log(err.stack);
    }
  };

  var parseValueAsYen = function(value) {
    var vars = value.match(/([+-\d,]*)円((\d+)銭)?/);
    var fs = vars[1];
    if (vars[3]) {
      fs = fs + "." + vars[3];
    }
    return fs;
  }

  var print = function () {
    valueMap.forEach(function (value, key) {
        console.log(key + ":" + value)
      })
  }

  var asTsv = function() {
      var sep = "\t"
      var header = ""
      var values = ""
      var i = 0;
      valueMap.forEach(function(value, key) {
          if (i > 0) {
            header = header + sep + key
            values = values + sep + value
          } else {
            header = key
            values = value
          }
          i++
      })

      var tsv = header + "\n" + values
      var tb = document.querySelector("#denki-scraper-text")
      tb.value = tsv;
      tb.select()
      try {
        document.execCommand('copy')
      } catch(err) {
        console.log(err)
      }

  }

  var appendOutputField = function() {
    var parent = document.querySelector(".info-select")
    var tb = parent.querySelector("#denki-scraper-text")
    if (tb) {
      parent.removeChild(tb)
    }
    tb = document.createElement("textarea")
    tb.id = 'denki-scraper-text'
    tb.style.width = "90%"
    tb.style.height = "auto"
    tb.wrap = "off"
    parent.appendChild(tb)
  }

  var output = function() {
    print()
    appendOutputField()
    asTsv()
  }

  // 対象年月
  var str = document.querySelector("#tgtYmDisp option[selected='selected']").text // 2021年03月
  vars = str.match(/(\d+)年(\d+)月/)
  var year = vars[1]
  var month = vars[2]
  valueMap.set("対象年月", year + "-" + month)

  // 請求金額
  var str = document.querySelectorAll(".info-content-main .info-price")[0].textContent // "12,345円"
  var vars = str.match(/([\d,]+)円/)
  monthlyCharge = vars[1]
  valueMap.set("請求金額", monthlyCharge)

  str = document.querySelectorAll(".info-content-main p")[1].textContent // "（ うち消費税等相当額 1,423円 ）"
  vars = str.match(/.* ([\d,]+)円/)
  taxIncluded = vars[1]
  valueMap.set("消費税相当額", taxIncluded)

  // 使用量
  str = document.querySelectorAll(".info-content-main .info-price")[1].textContent // "567kWh"
  vars = str.match(/([\d,]+)kWh/)
  usedEnergyMain = vars[1]
  valueMap.set("使用量[kWh]", usedEnergyMain)

  // 料金テーブル
  var costTableRows = document.querySelectorAll(".info-tbl .info-toggle-body tr")
  // 基本料金
  var basicCharge = costTableRows[0] // 1,230円00銭
  parseTableRowAsYen(basicCharge);
  // １段料金
  var charge1 = costTableRows[2] // "1,234円56銭"
  parseTableRowAsYen(charge1);

  // ２段料金
  var charge2 = costTableRows[3] // "1,234円56銭"
  parseTableRowAsYen(charge2);

  // ３段料金
  var charge3 = costTableRows[4] // "1,234円56銭"
  parseTableRowAsYen(charge3);

  // 燃料費調整額
  var adjcharge = costTableRows[5] // "-1,234円00銭"
  parseTableRowAsYen(adjcharge);

  // 再エネ発電賦課金
  var surcharge = costTableRows[6] // "1,234円00銭"
  parseTableRowAsYen(surcharge);

  // 口座振替割引
  var discount = costTableRows[7] // "-55円00銭"
  parseTableRowAsYen(discount);

 
  var tables = document.querySelectorAll(".info-section")

  // 託送料金などのテーブル追加によるフォーマット変化対応(2022/04分から表示される)
  var isAfterFY2022 = (year == 2022 && month >= 4 || year >= 2023)
  var isAfterFY2023 = (year == 2023 && month >= 4 || year >= 2024) // 2023/04以降
  var isAfterFY2023_10 = (year == 2023 && month >= 10 || year >= 2024) // 2023/10以降
  var isAfterFY2024_10 = (year == 2024 && month >= 10 || year >= 2025) // 2024/10以降
  var consignmentTableIndex = 1
  var useageTableIndex = 2
  var adjustmentTableIndex = 3
  var otherTableIndex = 4
  var meterTableIndex = 5
  if (!isAfterFY2022) {
    useageTableIndex = 2
    adjustmentTableIndex = 3
    otherTableIndex = 4
    meterTableIndex = 5
  }


  // 託送料金などのテーブル(2022/04から追加)
  if (isAfterFY2022) {
    var takusouIndex = 12
    var baishouIndex = 13
    if (isAfterFY2023) {
      takusouIndex = 11
      baishouIndex = 12
    }
    
    if (isAfterFY2023_10) {
      takusouIndex = 14
      baishouIndex = 15
    }

    if (isAfterFY2024_10) {
      var consignmentTable = tables[consignmentTableIndex].querySelectorAll(".info-tbl")[3];
      var consignmentRows = consignmentTable.querySelectorAll("tr")
      // 託送料金相当額
      var trElem = consignmentRows[0]
      parseTableRowAsYen(trElem)
      // うち賠償負担金相当額 および廃炉円滑化負担金相当額
      var trElem = consignmentRows[1]
      parseTableRowAsYen(trElem)

    } else {
      var consignmentRows = tables[consignmentTableIndex].querySelectorAll("tr")
      // 託送料金相当額
      var trElem = consignmentRows[takusouIndex]
      parseTableRowAsYen(trElem)
      // うち賠償負担金相当額 および廃炉円滑化負担金相当額
      var trElem = consignmentRows[baishouIndex] 
      parseTableRowAsYen(trElem)
    }
    
  }

  var periodIndex = 0 // 使用期間のtr index
  var inspectionIndex = 1 // 検診月日のtr index
  if (isAfterFY2023_10) {
    periodIndex = 1
    inspectionIndex = 2
  }

  // 使用量テーブル
  var usedRows = tables[useageTableIndex].querySelectorAll("tr")
  // 使用期間
  var trElem = usedRows[periodIndex] // "2月10日～ 3月11日"
  var header = trElem.querySelector("th").textContent
  var value = trElem.querySelector("td").textContent
  vars = value.match(/(\d+)月(\d+)日～ *(\d+)月 *(\d+)日/)
  var duration = vars[1] + "/" + vars[2] + "-" + vars[3] + "/" + vars[4]
  valueMap.set(header, duration)

  // 検針月日
  var trElem = usedRows[inspectionIndex] //"3月12日 （30日間）"
  var header = trElem.querySelector("th").textContent
  var value = trElem.querySelector("td").textContent
  vars = value.match(/(\d+)月(\d+)日 （(\d+)日間）/)
  var inspectionDate = year + "/" + vars[1] + "/" + vars[2]
  var durationDays = vars[3]
  valueMap.set(header, inspectionDate)
  valueMap.set("対象日数", durationDays)

  // 燃料費調整額テーブル
  var adjRows = tables[adjustmentTableIndex].querySelectorAll("tr")

  // 当月分
  if (year == 2023 && month == 6) {
    // 改定日（6/1）前後で適用が異なりますの表記がある
    var adjustRate = adjRows[1] // "-1円23銭"
    parseTableRowAsYen(adjustRate);

    // 翌月分
    var nextAdjustRate = adjRows[2] // "-1円23銭"
    parseTableRowAsYen(nextAdjustRate);

    // 翌月は当月に比べ
    valueMap.set("翌月は当月に比べ", '-')
  } else {
    var adjustRate = adjRows[0] // "-1円23銭"
    parseTableRowAsYen(adjustRate);

    // 翌月分
    var nextAdjustRate = adjRows[1] // "-1円23銭"
    parseTableRowAsYen(nextAdjustRate);

    // 翌月は当月に比べ
    var adjustRateDiff = adjRows[2] // "+0円12銭"
    parseTableRowAsYen(adjustRateDiff);
  }



  // その他テーブル
  var otherRows = tables[otherTableIndex].querySelectorAll("tr")
  // 再エネ発電賦課金単価　（1kWhあたり）
  var surchargeRate = otherRows[0] // "1円23銭"
  parseTableRowAsYen(surchargeRate);


  /* 2022/04から削除された項目 (現在は当時の期間選択しても表示されない)
  // 託送料金平均単価（1kWhあたり）
  var consignmentRate = otherRows[1] // "1円23銭"
  parseTableRowAsYen(consignmentRate);
  */
  // 2022/04以降の託送料金相当額から計算させてみる
  if (isAfterFY2022) {
    var usedTotal = parseInt(usedEnergyMain.replace(',', ''))
    var consignment = parseInt(valueMap.get("託送料金相当額")?.replace(',', '') || '-1');
    var consignmentRate = consignment / usedTotal;
    valueMap.set("託送料金平均単価（1kWhあたり）", consignmentRate)
  }

  // 計器情報テーブル
  var meterRows = tables[meterTableIndex].querySelectorAll("tr")
  // 当月指示数
  var meterCount = meterRows[0] // "12345.6"
  parseTableRow(meterCount)
  // 前月指示数
  var lastMeterCount = meterRows[1] // "12345.6"
  parseTableRow(lastMeterCount)
  // 差引
  var diff = meterRows[2] // "123.4"
  parseTableRow(diff)
  // 使用電力量
  var usedEnergy = meterRows[3] // "123"
  parseTableRow(usedEnergy)

  output()
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getData
  });
});