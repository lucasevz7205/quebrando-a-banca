import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const { chromium, webkit } = await import(process.env.QB_PLAYWRIGHT
  ? pathToFileURL(process.env.QB_PLAYWRIGHT).href : "playwright");
const route = fs.readFileSync("src/routes/_authed/estudar.jsx", "utf8");
const shell = fs.readFileSync("src/components/qb/study-shell.html", "utf8");
const admin = route.match(/'<link rel="stylesheet" href="\/claude-export\/admin-theme[^']+'/)[0].slice(1, -1);
const origin = "https://qb-mobile.test";
const types = { css: "text/css", js: "text/javascript", svg: "image/svg+xml", json: "application/json" };
const sizes = [[320, 740], [360, 780], [375, 812], [390, 844], [430, 932], [768, 1024]];

async function open(browser, viewport, isAdmin, touch = true) {
  const context = await browser.newContext({ viewport, isMobile:touch, hasTouch:touch, reducedMotion:"reduce" });
  const question = { id:"local-1", cap:"LOCAL", materia:"Matéria de teste", enunciado:"Uma afirmação para testar os controles em tela estreita.", gabarito:"C", comentario:"Comentário da questão de teste." };
  const docs = {
    questoes:[question],
    edital:[{id:"local-topic", materia:question.materia, titulo:"Assunto de teste", num:"1", caps:[question.cap]}],
    revisao:[{id:"local-topic",cartoes:[{q:"Qual é o conceito?",a:"Resposta do cartão de teste."}]}],
    rodadas:[0,2,4].map((offset,index)=>({
      id:"local-round-"+index,
      inicio:new Date(Date.now()-offset*86400000).toISOString(),
      cap:question.cap,
      itens:[{qid:question.id, marcada:index===1?"E":"C", gabarito:"C",conf:2}]
    }))
  };
  const script = `
    window.addEventListener("message", event => {
      const msg = event.data;
      if (event.origin !== location.origin || msg?.flag !== "__qb44_bridge_v1__" || !msg.id) return;
      const value = msg.action === "account" ? { legacy: ${isAdmin}, name: "Concurso local de teste" } :
        msg.action === "list" ? (${JSON.stringify(docs)})[msg.args.collection] || [] : null;
      event.source.postMessage({ flag:msg.flag, responseTo:msg.id, ok:true, value }, event.origin);
    });
    document.querySelector("iframe").srcdoc = ${JSON.stringify(isAdmin ? shell.replace("</body></html>", admin) : shell).replaceAll("<", "\\u003c")};
  `;
  const markup = '<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}iframe{width:100%;height:100svh;display:block;border:0}</style><iframe title="Estudar" scrolling="yes"></iframe><script>' + script + '</script>';
  await context.route("**/*", async request => {
    const url = new URL(request.request().url());
    if (url.origin !== origin) return request.abort();
    if (url.pathname === "/") return request.fulfill({ contentType:"text/html; charset=utf-8", body:markup });
    const path = "public" + url.pathname;
    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) return request.fulfill({status:404,body:""});
    return request.fulfill({ contentType:types[path.split(".").pop()] || "application/octet-stream", path });
  });
  context.setDefaultTimeout(6000);
  const page = await context.newPage();
  page.on("pageerror", error => console.error("iframe error:", error.message));
  await page.goto(origin, { waitUntil:"domcontentloaded" });
  const frame = page.frameLocator("iframe");
  await frame.locator("#main [data-radial-stage]").waitFor({timeout:6000});
  return {context,page,frame};
}

async function noOverflow(frame, label) {
  const sizes = await frame.locator("html").evaluate(el => [el.scrollWidth, el.clientWidth]);
  assert.ok(sizes[0] <= sizes[1] + 1, label + " document overflow " + sizes.join("/"));
}

async function checkScroll(context,page,frame,engine) {
  await frame.locator("html").evaluate(()=>window.scrollTo(0,0));
  if (engine==="Chromium") {
    const session=await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:140,y:640}]});
    for(let y=600;y>=320;y-=40){
      await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:140,y}]});
    }
    await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await session.detach();
  } else {
    await frame.locator("#qb-nav-toggle").press("PageDown");
  }
  await frame.locator("html").evaluate(async()=>{
    const end=performance.now()+1000;
    while(!window.scrollY&&performance.now()<end)await new Promise(requestAnimationFrame);
  });
  assert.ok(await frame.locator("html").evaluate(()=>window.scrollY>0));
}

async function screenshot(page, name) {
  if (process.env.QB_SCREENSHOTS) await page.screenshot({path: process.env.QB_SCREENSHOTS + "/" + name + ".png"});
}

for (const [name, engine] of [["Chromium",chromium],["WebKit",webkit]]) {
  if (process.env.QB_BROWSER && process.env.QB_BROWSER !== name) continue;
  const browser = await engine.launch();
  try {
    for (const [width,height] of sizes) {
      for (const landscape of [false,true]) {
        const viewport = landscape ? {width:height,height:width} : {width,height};
        const {context,page,frame} = await open(browser,viewport,true);
        try {
          if (viewport.width>960) {
            assert.equal(await frame.locator("#qb-primary-nav").isVisible(),true);
            await noOverflow(frame,"wide landscape");
            const wideStage=frame.locator("#main [data-radial-stage]");
            assert.notEqual(await wideStage.evaluate(el=>getComputedStyle(el).display),"grid");
            await wideStage.locator("[data-radial-module=historico]").tap();
            await frame.locator("[data-radial-back]").first().tap();
            console.log(name,viewport.width+"x"+viewport.height,"OK");
            continue;
          }
          const toggle=frame.locator("#qb-nav-toggle");
          const nav=frame.locator("#qb-primary-nav");
          assert.equal(await nav.isVisible(),false);
          await toggle.tap();
          assert.equal(await nav.locator("button[data-view]:visible").count(),7);
          const tabs=await nav.locator("button[data-view]").evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
          assert.ok(tabs.every(height=>height>=44), JSON.stringify(tabs));
          await noOverflow(frame,"sections");
          if (name==="Chromium"&&width===390&&!landscape) await screenshot(page,"390-secoes");
          await toggle.press("Escape");
          assert.equal(await nav.isVisible(),false);
          const stage=frame.locator("#main [data-radial-stage]");
          assert.equal(await stage.evaluate(el=>getComputedStyle(el).display), "grid");
          const boxes=await stage.locator(".qb-radial-node").evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
          assert.ok(boxes.every((b,i)=>b.height>=44&&boxes.slice(i+1).every(c=>b.right<=c.left||c.right<=b.left||b.bottom<=c.top||c.bottom<=b.top)));
          await noOverflow(frame,"menu");
          if (name==="Chromium"&&width===390&&!landscape) await screenshot(page,"390-menu");
          await stage.locator("[data-radial-module=historico]").tap();
          await frame.locator("[data-radial-back]").first().tap();
          await stage.locator("[data-radial-module=historico]").tap();
          await noOverflow(frame,"performance hub");
          await stage.locator("[data-radial-target=analiseDia]").tap();
          await frame.locator(".qb-analytics-kpis").waitFor();
          await noOverflow(frame,"daily performance");
          const date=frame.locator("#qb-insights-date");
          assert.ok((await date.boundingBox()).height>=44);
          if (width===320&&!landscape) await checkScroll(context,page,frame,name);
          if (name==="Chromium"&&width===390&&!landscape) {
            await screenshot(page,"390-desempenho");
            const launch=frame.locator("#qb-chat-launch");
            await launch.tap();
            await frame.locator(".omni-drawer").waitFor();
            await screenshot(page,"390-arquiteto");
            await frame.locator("#omni-tutor-input").fill("Pergunta local de teste");
            await noOverflow(frame,"tutor");
            await page.keyboard.press("Escape");
            assert.equal(await frame.locator(".omni-drawer").isVisible(),false);
            await frame.locator("[data-sub=historico]").tap();
            await frame.locator(".qb-history-main").waitFor();
            await frame.locator(".qb-history-dates summary").tap();
            await frame.locator("#evo-de").waitFor();
            await noOverflow(frame,"history filters");
            await screenshot(page,"390-historico");
            await frame.locator("[data-sub=metodo]").tap();
            await noOverflow(frame,"method");
            await toggle.tap();
            await nav.locator("#tab-treinar").tap();
            await frame.locator("[data-train-matter]").first().tap();
            await frame.locator("[data-train-topic]").first().tap();
            await frame.locator("#start").tap();
            await screenshot(page,"390-responder");
            await frame.locator("[data-ans=E]").tap();
            assert.equal(await frame.locator("[data-origem]").count(),0);
            await frame.locator("[data-conf='2']").tap();
            await frame.locator("[data-origem]").first().tap();
            await frame.locator("#just-txt").fill("A regra apresentada está correta, por isso a resposta é certa.");
            assert.equal(await frame.locator("html").getAttribute("data-qb-foco"),"1");
            await noOverflow(frame,"question feedback");
            await screenshot(page,"390-questao");
            await toggle.tap();
            await nav.locator("#tab-portal").tap();
            await stage.locator("[data-radial-module=estudo]").tap();
            await stage.locator("[data-radial-target=cartoes]").tap();
            await frame.locator("[data-cart-foco]").tap();
            await frame.locator("[data-cresp]").fill("Minha resposta de memória");
            await frame.locator("[data-cver]").tap();
            assert.equal(await frame.locator(".qb-flashcard-focus").getAttribute("data-revealed"),"true");
            await frame.locator("[data-cav]").last().tap();
            await frame.locator("[data-cmix-next]").waitFor();
            await noOverflow(frame,"flashcard");
            await screenshot(page,"390-flashcard");
          }
          console.log(name,viewport.width+"x"+viewport.height,"OK");
        } finally { await context.close(); }
      }
    }
    const {context,frame}=await open(browser,{width:1280,height:900},false,false);
    assert.equal(await frame.locator("#qb-nav-toggle").isVisible(),false);
    assert.equal(await frame.locator("#qb-primary-nav").isVisible(),true);
    assert.notEqual(await frame.locator("#main [data-radial-stage]").evaluate(el=>getComputedStyle(el).display),"grid");
    await noOverflow(frame,"desktop");
    await context.close();
  } finally { await browser.close(); }
}
