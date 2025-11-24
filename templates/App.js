// app.js — runs in the WebApp environment
(function () {
  const root = document.getElementById("products");
  const products = window.__BB.products || [];
  const refCode = window.__BB.refCode;
  const userId = window.__BB.userId;

  function createCard(p) {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <div class="meta">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="price">₹ ${p.price_inr}</div>
      </div>
      <div class="actions">
        <button class="btn btn-buy" data-id="${p.id}">Buy</button>
        <button class="btn btn-share" data-id="${p.id}">Share</button>
      </div>
    `;
    // event handlers
    card.querySelector(".btn-buy").onclick = function () {
      // open buy endpoint in webapp with options (BB will map GET params for us)
      // We use window.location to call a URL that triggers a BJS command if needed,
      // but safer pattern: call `Telegram.WebApp.sendData` only if inside Telegram.
      const payload = { action: "buy", productId: p.id, ref: refCode, userId: userId };
      if (window.Telegram && Telegram.WebApp) {
        // sendData will be received by Bot as web_app_data: use Api to parse
        Telegram.WebApp.sendData(JSON.stringify(payload));
        // optionally show a message to user
        Telegram.WebApp.close();
      } else {
        // Fallback: open a simple link to call a webapp command with options
        const url = new URL(window.location.href);
        url.searchParams.set("action","buy");
        url.searchParams.set("productId", p.id);
        url.searchParams.set("ref", refCode);
        window.open(url.toString(), "_blank");
      }
    };

    card.querySelector(".btn-share").onclick = function () {
      // Allow user to copy referral/resell link
      const shareUrl = `https://t.me/${window.Telegram ? window.Telegram.initDataUnsafe?.user?.username || '' : ''}?start=ref_${refCode}_${p.id}`;
      navigator.clipboard?.writeText(shareUrl).then(()=> alert("Referral link copied!"));
    };

    return card;
  }

  // render
  products.forEach(p => root.appendChild(createCard(p)));
})();
