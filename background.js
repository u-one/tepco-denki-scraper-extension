function getData() {
  // 対象年月
  var target = document.querySelector("#tgtYmDisp option[selected='selected']").text // 2021年03月
  console.log(target)

  // 請求金額
  var monthlyCharge = document.querySelectorAll(".info-content-main .info-price")[0].textContent // "12,345円"
  var taxIncluded = document.querySelectorAll(".info-content-main p")[1].textContent // "（ うち消費税等相当額 1,423円 ）"
  
  // 使用量
  var usedEnergyMain = document.querySelectorAll(".info-content-main .info-price")[1].textContent // "567kWh"

  console.log(monthlyCharge)
  console.log(taxIncluded)
  console.log(usedEnergyMain)

  // 料金テーブル
  var costTableRows = document.querySelectorAll(".info-tbl .info-toggle-body tr")
  // 基本料金
  var basicCharge = costTableRows[0].querySelector("td").textContent // 1,230円00銭
  // １段料金
  var charge1 = costTableRows[2].querySelector("td").textContent // "1,234円56銭"
  // ２段料金
  var charge2 = costTableRows[3].querySelector("td").textContent // "1,234円56銭"
  // ３段料金
  var charge3 = costTableRows[4].querySelector("td").textContent // "1,234円56銭"
  // 燃料費調整額
  var adjcharge = costTableRows[5].querySelector("td").textContent // "-1,234円00銭"
  // 再エネ発電賦課金
  var surcharge = costTableRows[6].querySelector("td").textContent // "1,234円00銭"
  // 口座振替割引
  var discount = costTableRows[7].querySelector("td").textContent // "-55円00銭"

 
  var tables = document.querySelectorAll(".info-tbl")

  // 使用量テーブル
  var usedRows = tables[3].querySelectorAll("tr")
  var duration = usedRows[0].querySelector("td").textContent // "2月10日～ 3月11日"
  var inspectionDate = usedRows[1].querySelector("td").textContent //"3月12日 （30日間）"

  console.log(duration)
  console.log(inspectionDate)

  // 燃料費調整額テーブル
  var adjRows = tables[4].querySelectorAll("tr")
  // 当月分
  var adjustRate = adjRows[0].querySelector("td").textContent // "-1円23銭"
  // 翌月分
  var nextAdjustRate = adjRows[1].querySelector("td").textContent // "-1円23銭"
  // 翌月は当月に比べ
  var adjustRateDiff = adjRows[2].querySelector("td").textContent // "+0円12銭"

  console.log(adjustRate)
  console.log(nextAdjustRate)
  console.log(adjustRateDiff)

  // その他テーブル
  var otherRows = tables[5].querySelectorAll("tr")
  // 再エネ発電賦課金単価　（1kWhあたり）
  var surchargeRate = otherRows[0].querySelector("td").textContent // "1円23銭"
  // 託送料金平均単価（1kWhあたり）
  var consignmentRate = otherRows[1].querySelector("td").textContent // "1円23銭"

  console.log(surchargeRate)
  console.log(consignmentRate)

  // 計器情報テーブル
  var meterRows = tables[6].querySelectorAll("tr")
  // 当月指示数
  var meterCount = meterRows[0].querySelector("td").textContent // "12345.6"
  // 前月指示数
  var lastMeterCount = meterRows[1].querySelector("td").textContent // "12345.6"
  // 差引
  var diff = meterRows[2].querySelector("td").textContent // "123.4"
  // 使用電力量
  var usedEnergy = meterRows[3].querySelector("td").textContent // "123"

  console.log(meterCount)
  console.log(lastMeterCount)
  console.log(diff)
  console.log(usedEnergy)

}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getData
  });
});