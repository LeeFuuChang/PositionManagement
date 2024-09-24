const Language = {
    "crossMargin": {
        "en": "Cross",
        "zh": "全倉",
    },
    "isolatedMargin": {
        "en": "Isolated",
        "zh": "逐倉",
    },
    "availableMargin": {
        "en": "Available Margin",
        "zh": "可用金額",
    },
    "maxLeverageAcceptable": {
        "en": "Max Leverage Acceptable",
        "zh": "最大可承受槓桿",
    },
    "maxLossAcceptable": {
        "en": "Max Loss Acceptable",
        "zh": "最大可承受損失",
    },
    "tradingFeeRate": {
        "en": "Trading Fee Rate (%)",
        "zh": "手續費率 (%)",
    },
    "calculatePosition": {
        "en": "Calculate Position",
        "zh": "計算倉位",
    },
    "nextLanguage": {
        "en": "中文版",
        "zh": "English",
    },
    "tradingPlan": {
        "en": "Trading Plan",
        "zh": "交易計劃",
    },
    "entryPrice": {
        "en": "Entry Price",
        "zh": "入場價",
    },
    "stopLossPrice": {
        "en": "SL Price",
        "zh": "止損價",
    },
    "takeProfitPrice": {
        "en": "TP Price",
        "zh": "止盈價",
    },
    "riskRewardRatio": {
        "en": "Risk / Reward",
        "zh": "盈虧比",
    },
    "positionManagement": {
        "en": "Position Management",
        "zh": "倉位管理",
    },
    "leverage": {
        "en": "Leverage",
        "zh": "槓桿倍數",
    },
    "margin": {
        "en": "Margin",
        "zh": "保證金",
    },
    "positionSize": {
        "en": "Position Size",
        "zh": "倉位大小",
    },
    "lossAtStopLoss": {
        "en": "SL Loss",
        "zh": "止損損失",
    },
    "breakEvenPrice": {
        "en": "BE Price",
        "zh": "平衡套保價",
    },
    "saveResult": {
        "en": "Save",
        "zh": "儲存",
    },
};
const Suggestions = [
    {
        "en": "Take partial profit when market sturcture changes, don't wait until you loss your profit",
        "zh": "當超越前高或跌破前低，部分止盈，別等利潤回撤再後悔",
    }, {
        "en": "Control your risk, if you feel nervous or anxious, means you can't take it, please close the trade",
        "zh": "控制交易的風險與成本，當你感到緊張或焦慮，代表你無法承受這筆交易，請立即出場",
    }, {
        "en": "Think before you move your entry, you might get yourself in a terrible situation",
        "zh": "不要隨意移動你的入場價，說不定就錯過或套牢了",
    }, {
        "en": "Think before you move your stop loss, or else, you might blame that to be the reason you loss",
        "zh": "不要隨意移動你的止損，因為止損後，你會認為是你調整了的問題，不服氣，重開一單，再次止損",
    },
];



function LoadSuggestion() {
    $("#suggestion").text(Suggestions[Math.floor(Math.random()*Suggestions.length)][$("body").attr("language")]);
}

function LoadLanguage() {
    $(".lang").get().forEach(ele=>{
        let text = Language[$(ele).attr("lang")][$("body").attr("language")]
        $(ele).text(text).val(text);
    });
    LoadSuggestion();
}



function round(a, b) {
    return Math.round(a*Math.pow(10,b))/Math.pow(10,b);
}



function CollectOrder(marginType) {
    const Order = {
        marginType: marginType,
        entryPrice: parseFloat($("#entryPrice").val()),
        stopLossPrice: parseFloat($("#stopLossPrice").val()),
        takeProfitPrice: parseFloat($("#takeProfitPrice").val()),
        availableMargin: parseFloat($("#availableMargin").val()),
        maxLeverageAcceptable: parseFloat($("#maxLeverageAcceptable").val()),
        maxLossAcceptable: parseFloat($("#maxLossAcceptable").val()),
        tradingFeeRate: parseFloat($("#tradingFeeRate").val()) / 100,
    };
    
    Order.direction = (Order.entryPrice > Order.stopLossPrice) ? 1 : -1;
    
    Order.precision = 1 + Math.max(
        `${Order.entryPrice}.`.split(".")[1].length,
        `${Order.stopLossPrice}.`.split(".")[1].length,
    );
    
    Order.breakEvenPrice = round(Order.entryPrice*(1 + Order.direction*Order.tradingFeeRate*2), Order.precision);
    
    Order.stopLossPriceChange = Math.abs(1 - Order.stopLossPrice/Order.entryPrice);
    Order.takeProfitPriceChange = Math.abs(1 - Order.takeProfitPrice/Order.entryPrice);

    Order.riskRewardRatio = round(Order.takeProfitPriceChange/Order.stopLossPriceChange, 4);

    Order.riskRewardSuitability = 0;
    if(     Order.riskRewardRatio && Order.riskRewardRatio < 1) Order.riskRewardSuitability = "👎 Bad";
    if(1 <= Order.riskRewardRatio && Order.riskRewardRatio < 3) Order.riskRewardSuitability = "👌 Okay";
    if(3 <= Order.riskRewardRatio && Order.riskRewardRatio < 7) Order.riskRewardSuitability = "👍 Great";
    if(7 <= Order.riskRewardRatio && Order.riskRewardRatio    ) Order.riskRewardSuitability = "🤔 Risky";
    
    Order.positionSize = Order.maxLossAcceptable/Order.stopLossPriceChange;

    // Cross Margin can use max leverage to utilize funds
    Order.suggestedLeverage = Order.maxLeverageAcceptable;
    if(Order.marginType == "Isolated") {
        // Calculate leverage by 2x loss to set stoploss at 50% to prevent Isolated liq
        Order.suggestedLeverage = Math.min(
            round(Order.positionSize/(Order.maxLossAcceptable*2), 0),
            Order.suggestedLeverage,
        );
    }

    Order.suggestedMargin = Math.min(
        round(Order.positionSize/Order.suggestedLeverage, 2),
        Order.availableMargin,
    );

    Order.suggestedPositionSize = Order.suggestedMargin*Order.suggestedLeverage;

    Order.lossAtStopLoss = round(Order.suggestedPositionSize*Order.stopLossPriceChange, 2);
    Order.totalTradeFee = round(Order.suggestedPositionSize*Order.tradingFeeRate*2, 2);

    return Order;
}

function FormatOutput(order) {
    return (
        "Order Info:\n" +
        `\tEntry Price: ${order.entryPrice}\n` +
        `\tStop Loss Price: ${order.stopLossPrice} (${round(-order.direction*order.stopLossPriceChange*100, 1)}%)\n` +
        `\tTake Profit Price: ${order.takeProfitPrice} (${round(order.direction*order.takeProfitPriceChange*100, 1)}%)\n` +
        `\tRisk Reward Ratio: ${order.riskRewardRatio} (${order.riskRewardSuitability})\n` +
        `${order.marginType} Margin:\n` +
        `\tLeverage: ${order.suggestedLeverage}\n` +
        `\tMargin: ${order.suggestedMargin}\n` +
        `\tPosition Size: ${order.suggestedPositionSize}\n` +
        `\tLoss at Stop Loss: ${order.lossAtStopLoss} + ${order.totalTradeFee} Fee\n` +
        `\tBreak Even Price: ${order.breakEvenPrice} (${round(order.direction*order.tradingFeeRate*2*100, 1)}%)\n`
    );
}



$(function(){
    LoadLanguage();
    $(".margin-type").on("click", function(){
        $(this).addClass("active").siblings().removeClass("active");
    });
    $("#submit").on("click", ()=>{
        $("aside").css("display", "flex");
        $("article").css("top", "200%");
        let order = CollectOrder($(".margin-type.active").val());
        let output = {
            "entryPrice": `${order.entryPrice}`,
            "stopLoss": `${order.stopLossPrice} (${round(-order.direction*order.stopLossPriceChange*100, 1)}%)`,
            "takeProfit": `${order.takeProfitPrice} (${round(order.direction*order.takeProfitPriceChange*100, 1)}%)`,
            "riskRewardRatio": `${order.riskRewardRatio} (${order.riskRewardSuitability})`,
            "leverage": `${order.suggestedLeverage}`,
            "margin": `${order.suggestedMargin}`,
            "positionSize": `${order.suggestedPositionSize}`,
            "lossAtStopLoss": `${order.lossAtStopLoss} + ${order.totalTradeFee} Fee`,
            "breakEvenPrice": `${order.breakEvenPrice} (${round(order.direction*order.tradingFeeRate*2*100, 1)}%)`,
        };
        Object.keys(output).forEach(key=>{
            $(`article tr[data-name="${key}"] td`).last().text(output[key]);
            $("article h1")
                .text(order.direction > 0 ? "LONG" : "SHORT")
                .css("background-color", order.direction > 0 ? "#32D993" : "#FF707E");
        });
        html2canvas($("aside").get(0)).then(canvas=>{
            $("#save").attr("href", canvas.toDataURL("image/png"));
        });
        $("article").animate({"top":"0%"}, 300);
    });
    $("aside").on("click", (e)=>{
        if(e.currentTarget != e.target) return;
        $("aside").css("display", "none");
    });
    $("a.language").on("click", ()=>{
        let languages = ["en", "zh"];
        $("body").attr("language", languages[(languages.indexOf($("body").attr("language"))+1)%languages.length]);
        LoadLanguage();
    });
});
