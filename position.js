function round(a, b) {
    return Math.round(a*Math.pow(10,b))/Math.pow(10,b);
}



function CollectOrder(marginType) {
    const Order = {
        marginType: marginType,
        entryPrice: parseFloat($("#entryPrice").val()),
        stopLossPrice: parseFloat($("#stopLossPrice").val()),
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
    
    Order.stopLossPriceChange = Math.abs(1 - Order.entryPrice/Order.stopLossPrice);
    
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
        `\tStopLoss Price: ${order.stopLossPrice} (${round(Order.direction*Order.stopLossPriceChange, 1)}%)\n` +
        `\tBreak Even Price: ${Order.breakEvenPrice} (${round(Order.direction*Order.tradingFeeRate*2, 1)}%)\n` +
        `${order.marginType} Margin:\n` +
        `\tLeverage: ${order.suggestedLeverage}\n` +
        `\tMargin: ${order.suggestedMargin}\n` +
        `\tPosition Size: ${order.suggestedPositionSize}\n` +
        `\tLoss at SL: ${order.lossAtStopLoss+order.totalTradeFee} (${order.lossAtStopLoss} Loss + ${order.totalTradeFee} Fee)`
    );
}



$(function(){
    $("#cross").on("click", ()=>$("pre").text(FormatOutput(CollectOrder("Cross"))));
    $("#isolated").on("click", ()=>$("pre").text(FormatOutput(CollectOrder("Isolated"))));
});
