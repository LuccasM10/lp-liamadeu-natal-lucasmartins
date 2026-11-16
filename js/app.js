(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var numero = window.WHATSAPP_LOJA || "5545999127938";
  var status = window.STATUS_PRODUTOS || {};
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";

  /* ---- Pixel da Meta (não dispara em teste local) ---- */
  if (window.PIXEL_META && !local) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", window.PIXEL_META);
    window.fbq("track", "PageView");
  }

  /* ---- Links de WhatsApp com mensagem pronta + evento Contact ---- */
  document.querySelectorAll(".js-whats").forEach(function (a) {
    var msg = a.getAttribute("data-msg");
    a.href = "https://wa.me/" + numero + (msg ? "?text=" + encodeURIComponent(msg) : "");
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () {
      if (typeof window.fbq === "function") {
        window.fbq("track", "Contact", { content_name: a.getAttribute("data-produto") || "WhatsApp" });
      }
    });
  });

  /* ---- Status por produto ---- */
  var rotulos = { ultimas: "Últimas unidades", esgotado: "Esgotado" };
  document.querySelectorAll(".card[data-id]").forEach(function (card) {
    var s = status[card.getAttribute("data-id")];
    if (!rotulos[s]) return;
    card.classList.add(s);
    var selo = document.createElement("span");
    selo.className = "selo-status";
    selo.textContent = rotulos[s];
    card.appendChild(selo);
    if (s === "esgotado") {
      card.querySelectorAll(".btn-card").forEach(function (b) {
        b.textContent = "Esgotado";
        b.removeAttribute("href");
        b.setAttribute("aria-disabled", "true");
      });
    }
  });

  /* ---- Aviso de rascunho: conta itens a confirmar ---- */
  var pendentes = document.querySelectorAll(".pendente").length;
  var aviso = document.getElementById("aviso-rascunho");
  var qtd = document.getElementById("qtd-pendentes");
  if (pendentes && aviso) {
    if (qtd) qtd.textContent = pendentes;
    aviso.hidden = false;
  }

  /* ---- Botão flutuante aparece sempre que o botão principal do topo está fora da tela
         (acima, depois de rolar; ou abaixo, em celulares baixos onde o vídeo o empurra) ---- */
  var flutuante = document.getElementById("flutuante");
  var heroBtn = document.querySelector(".hero .btn-principal");
  if ("IntersectionObserver" in window && heroBtn) {
    new IntersectionObserver(function (e) {
      flutuante.classList.toggle("visivel", !e[0].isIntersecting);
    }).observe(heroBtn);
  } else {
    flutuante.classList.add("visivel");
  }

  /* ---- Zoom: toque/clique na foto abre ampliada (versão maior do srcset) ---- */
  var fotos = document.querySelectorAll(".card-foto img, .emb-galeria img, .emb-destaque img");
  if (fotos.length) {
    var zoom = document.createElement("div");
    zoom.className = "zoom";
    zoom.setAttribute("role", "dialog");
    zoom.setAttribute("aria-modal", "true");
    zoom.setAttribute("aria-label", "Foto ampliada");
    zoom.innerHTML = '<button type="button" class="zoom-fechar" aria-label="Fechar foto">&times;</button><img alt=""><p class="zoom-legenda">Toque fora da foto para fechar</p>';
    document.body.appendChild(zoom);
    var zImg = zoom.querySelector("img");
    var zBtn = zoom.querySelector(".zoom-fechar");
    var origem = null;
    var maior = function (img) {
      var set = img.getAttribute("srcset");
      if (!set) return img.currentSrc || img.src;
      var melhor = null, w = 0;
      set.split(",").forEach(function (parte) {
        var p = parte.trim().split(/\s+/), n = parseInt(p[1], 10) || 0;
        if (n >= w) { w = n; melhor = p[0]; }
      });
      return melhor || img.src;
    };
    var abrir = function (img) {
      origem = img;
      zImg.src = maior(img);
      zImg.alt = img.alt || "";
      zoom.classList.add("aberto");
      document.body.classList.add("sem-rolagem");
      zBtn.focus();
    };
    var fechar = function () {
      if (!zoom.classList.contains("aberto")) return;
      zoom.classList.remove("aberto");
      document.body.classList.remove("sem-rolagem");
      if (origem) origem.focus();
    };
    fotos.forEach(function (img) {
      img.classList.add("js-zoom");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Ampliar foto: " + (img.alt || ""));
      img.addEventListener("click", function () { abrir(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(img); }
      });
    });
    zoom.addEventListener("click", function (e) { if (e.target !== zImg) fechar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });
  }
  window.__zoomOk = true;

  /* ---- Destaca a categoria atual nos atalhos ---- */
  var links = {};
  document.querySelectorAll(".atalhos a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove("ativo"); });
        var l = links[en.target.id];
        if (l) {
          l.classList.add("ativo");
          var ul = l.closest("ul");
          ul.scrollTo({ left: l.offsetLeft - ul.clientWidth / 2 + l.clientWidth / 2, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }
})();
