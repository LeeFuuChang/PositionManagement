function PNL(a,e,r){return Math.round(100*Math.abs(e/a-1)*r*100)/100}$((function(){const a=new URL(location.href);["direction","leverage","coin","entry","price"].some((e=>!a.searchParams.has(e)))||($("body").html(`<article id="PNL"><img class="background" src="pc_dark_basic.png"><img class="banner" src="futures_dark.png"><div><h2 style="color:${{"多":"#2EBD85","空":"#F6465D"}[a.searchParams.get("direction")]}">做${a.searchParams.get("direction")}</h2><span></span><h2>${a.searchParams.get("leverage")}X</h2><span></span><h2>${a.searchParams.get("coin")}USDT 永續</h2></div><div><h1>+${PNL(parseFloat(a.searchParams.get("entry")),parseFloat(a.searchParams.get("price")),parseInt(a.searchParams.get("leverage")))}%</h1></div><div><h2>開倉價格</h2><h2>${a.searchParams.get("entry")}</h2><h2>標記價格</h2><h2>${a.searchParams.get("price")}</h2></div><div><img src="qrcode.jpg"><h3>推薦碼</h3><h1>881245906</h1></div></article>`),html2canvas($("#PNL").get(0)).then((e=>{const r=$(`<a style="display:none" href="${e.toDataURL("image/png")}" download="${a.searchParams.get("coin")}-${a.searchParams.get("direction")}.png"></a>`).appendTo($("body")).get(0);r.click(),r.remove()})))}));
