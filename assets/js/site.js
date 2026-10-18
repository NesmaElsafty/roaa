(function () {
  var loader = document.querySelector(".loader");
  var indexItems = document.querySelectorAll(".about-index li");
  if (indexItems.length) {
    indexItems.forEach(function (item) {
      item.classList.add("reveal-item");
    });
  }
  if (loader) {
    window.setTimeout(function () {
      loader.classList.add("is-done");
      window.setTimeout(function () {
        loader.remove();
      }, 480);
    }, 2000);
  }
  if (indexItems.length) {
    window.setTimeout(function () {
      indexItems.forEach(function (item) {
        item.classList.add("is-in");
      });
    }, loader ? 2200 : 80);
  }

  var root = document.documentElement;
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".menu");
  var themeButton = document.querySelector(".theme-toggle");

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  document.querySelectorAll(".menu__caret").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".menu__dropwrap");
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("roaa-theme", theme);
    } catch (error) {}
    if (themeButton) {
      var dark = theme === "dark";
      themeButton.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      themeButton.setAttribute("aria-pressed", dark ? "true" : "false");
    }
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
    applyTheme(root.getAttribute("data-theme") || "light");
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var galleryRoot = document.querySelector("[data-gallery]");
  if (galleryRoot && window.ROAA_GALLERY) {
    var filters = document.querySelector("[data-filters]");
    var current = "all";

    function paintFilters() {
      var all = document.createElement("button");
      all.type = "button";
      all.textContent = "All";
      all.dataset.slug = "all";
      filters.appendChild(all);
      window.ROAA_GALLERY.forEach(function (group) {
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = group.label;
        button.dataset.slug = group.slug;
        filters.appendChild(button);
      });
      filters.addEventListener("click", function (event) {
        var button = event.target.closest("button");
        if (!button) return;
        location.hash = button.dataset.slug === "all" ? "" : button.dataset.slug;
        show(button.dataset.slug);
      });
    }

    function show(slug) {
      current = slug || "all";
      filters.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.slug === current ? "true" : "false");
      });
      galleryRoot.innerHTML = "";
      window.ROAA_GALLERY.forEach(function (group) {
        if (current !== "all" && group.slug !== current) return;
        group.images.forEach(function (src, index) {
          var button = document.createElement("button");
          button.type = "button";
          var img = document.createElement("img");
          img.src = src;
          img.alt = group.label + " project " + (index + 1) + " by ROAA";
          button.appendChild(img);
          button.addEventListener("click", function () {
            openLightbox(src, img.alt);
          });
          galleryRoot.appendChild(button);
        });
      });
      if (typeof showActiveFilter === "function") showActiveFilter();
    }

    paintFilters();
    var filterView = filters.parentElement;
    var filterPrev = document.querySelector("[data-filter-prev]");
    var filterNext = document.querySelector("[data-filter-next]");
    var filterDots = document.querySelector("[data-filter-dots]");
    var filterPage = 0;

    function filterPageCount() {
      var width = filterView.clientWidth;
      if (!width) return 1;
      return Math.max(1, Math.ceil(filters.scrollWidth / width));
    }

    function paintFilterDots(page, count) {
      filterDots.innerHTML = "";
      for (var i = 0; i < count; i += 1) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Category page " + (i + 1));
        dot.setAttribute("aria-current", i === page ? "true" : "false");
        dot.addEventListener("click", function (event) {
          var index = Array.prototype.indexOf.call(filterDots.children, event.currentTarget);
          moveFilters(index);
        });
        filterDots.appendChild(dot);
      }
      filterPrev.disabled = page <= 0;
      filterNext.disabled = page >= count - 1;
    }

    function moveFilters(page) {
      var count = filterPageCount();
      filterPage = Math.max(0, Math.min(count - 1, page));
      var shift = Math.min(filters.scrollWidth - filterView.clientWidth, filterPage * filterView.clientWidth);
      filters.style.transform = "translateX(" + (-Math.max(0, shift)) + "px)";
      paintFilterDots(filterPage, count);
    }

    function showActiveFilter() {
      var active = filters.querySelector("[aria-pressed='true']");
      if (!active || !filterView.clientWidth) return;
      moveFilters(Math.floor(active.offsetLeft / filterView.clientWidth));
    }

    filterPrev.addEventListener("click", function () { moveFilters(filterPage - 1); });
    filterNext.addEventListener("click", function () { moveFilters(filterPage + 1); });
    window.addEventListener("resize", function () { moveFilters(filterPage); });
    moveFilters(0);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveFilters(filterPage); });
    }

    var hash = location.hash.replace("#", "");
    var known = window.ROAA_GALLERY.some(function (group) {
      return group.slug === hash;
    });
    show(known ? hash : "all");
    window.addEventListener("hashchange", function () {
      var next = location.hash.replace("#", "");
      var exists = window.ROAA_GALLERY.some(function (group) {
        return group.slug === next;
      });
      show(exists ? next : "all");
    });
  }

  var dialog = document.querySelector(".lightbox");

  function openLightbox(src, alt) {
    if (!dialog) return;
    dialog.querySelector("img").src = src;
    dialog.querySelector("img").alt = alt;
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
    });
    document.querySelectorAll("[data-lightbox]").forEach(function (button) {
      button.addEventListener("click", function () {
        var img = button.querySelector("img");
        if (img) openLightbox(img.getAttribute("src"), img.alt);
      });
    });
  }

  var mapDialog = document.querySelector("[data-map]");
  if (mapDialog) {
    var mapFrame = mapDialog.querySelector("iframe");
    document.querySelectorAll("[data-map-open]").forEach(function (opener) {
      opener.addEventListener("click", function () {
        if (mapFrame && !mapFrame.getAttribute("src")) mapFrame.src = mapFrame.dataset.src;
        if (typeof mapDialog.showModal === "function") mapDialog.showModal();
      });
    });
    mapDialog.addEventListener("click", function (event) {
      if (event.target === mapDialog) mapDialog.close();
    });
  }

  var form = document.querySelector("[data-contact]");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var error = field.parentElement.querySelector(".field__error");
        var message = "";
        if (!field.value.trim()) message = "This field is required.";
        else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          message = "Enter a valid email address.";
        }
        if (error) {
          error.hidden = !message;
          error.textContent = message;
        }
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (message) valid = false;
      });
      if (!valid) return;
      var submit = form.querySelector(".contact-submit");
      if (!submit) {
        window.location.href = "thank-you.html";
        return;
      }
      submit.classList.add("is-sending");
      submit.disabled = true;
      window.setTimeout(function () {
        window.location.href = "thank-you.html";
      }, 560);
    });
  }

  var aboutIndex = document.querySelector(".about-index");
  if (aboutIndex) {
    var scrollLock = false;

    function headerOffset() {
      var header = document.querySelector(".topbar");
      return header ? header.getBoundingClientRect().height : 0;
    }

    function stopPositions() {
      var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var stops = Array.prototype.map.call(document.querySelectorAll(".about-index, .story"), function (panel) {
        return Math.max(0, Math.min(max, panel.getBoundingClientRect().top + window.scrollY - headerOffset()));
      });
      if (!stops.length || stops[stops.length - 1] < max - 4) stops.push(max);
      return stops;
    }

    function nearestStop() {
      var y = window.scrollY;
      var stops = stopPositions();
      var best = 0;
      stops.forEach(function (stop, index) {
        if (Math.abs(stop - y) < Math.abs(stops[best] - y)) best = index;
      });
      return best;
    }

    function glideTo(y) {
      var start = window.scrollY;
      var distance = y - start;
      if (Math.abs(distance) < 2) return;
      var duration = Math.min(1600, Math.max(1050, Math.abs(distance) * 0.62));
      var startTime = null;
      scrollLock = true;
      function step(now) {
        if (!startTime) startTime = now;
        var t = Math.min(1, (now - startTime) / duration);
        var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, start + distance * eased);
        if (t < 1) requestAnimationFrame(step);
        else window.setTimeout(function () { scrollLock = false; }, 160);
      }
      requestAnimationFrame(step);
    }

    document.querySelectorAll(".about-index a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        glideTo(target.getBoundingClientRect().top + window.scrollY - headerOffset());
        history.pushState(null, "", link.hash);
      });
    });

    window.addEventListener("wheel", function (event) {
      if (!window.matchMedia("(min-width: 900px)").matches) return;
      event.preventDefault();
      if (scrollLock || Math.abs(event.deltaY) < 12) return;
      var stops = stopPositions();
      var index = nearestStop();
      var next = event.deltaY > 0 ? Math.min(stops.length - 1, index + 1) : Math.max(0, index - 1);
      if (next !== index) glideTo(stops[next]);
    }, { passive: false });
  }

  var revealRoot = document.querySelector("main");
  if (revealRoot) {
    var loaderDone = !loader;
    var waitQueue = [];
    var photoCount = 0;
    var copySelector = [
      ".hero__copy",
      ".section__head",
      ".service",
      ".project",
      ".ally",
      ".card",
      ".brand-card",
      ".story__copy",
      ".contact-card",
      ".filters",
      "section.section > h2",
      "section.section > ul",
      ".page-hero > .kicker",
      ".page-hero > h1",
      ".page-hero > .lede",
      ".page-hero > .rule",
      "[data-reveal]"
    ].join(",");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        arm(entry.target);
      });
    }, { threshold: 0.18 });

    function arm(node) {
      if (!node || node.classList.contains("is-in") || node.classList.contains("is-shown")) return;
      if (!loaderDone) {
        waitQueue.push(node);
        return;
      }
      node.classList.add("is-in");
      revealObserver.unobserve(node);
      node.addEventListener("animationend", function () {
        node.classList.add("is-shown");
      }, { once: true });
    }

    function collect(scope, selector) {
      var found = [];
      if (scope.matches && scope.matches(selector)) found.push(scope);
      var search = scope.ownerDocument || document;
      search.querySelectorAll(selector).forEach(function (node) {
        if (node !== scope && scope.contains && scope.contains(node)) found.push(node);
      });
      return found;
    }

    function bindReveal(scope) {
      collect(scope, "img").forEach(function (img) {
        if (img.closest(".topbar, .footer, .loader, .lightbox, .brand-card, .ally")) return;
        if (img.closest(".gallery-grid")) {
          if (img.classList.contains("reveal-fade")) return;
          var tile = img.parentElement;
          var tiles = tile && tile.parentElement ? tile.parentElement.children : [];
          var place = Math.max(0, Array.prototype.indexOf.call(tiles, tile));
          img.classList.add("reveal-fade");
          img.style.animationDelay = (place % 4) * 0.1 + "s";
          revealObserver.observe(img);
          return;
        }
        if (img.classList.contains("reveal-right") || img.classList.contains("reveal-left")) return;
        img.classList.add(photoCount % 2 === 0 ? "reveal-right" : "reveal-left");
        photoCount += 1;
        revealObserver.observe(img);
      });
      collect(scope, copySelector).forEach(function (node) {
        if (node.closest(".topbar, .footer, .loader")) return;
        if (node.classList.contains("reveal-copy")) return;
        node.classList.add("reveal-copy");
        revealObserver.observe(node);
      });
    }

    bindReveal(revealRoot);
    window.ROAAReveal = bindReveal;

    if (window.MutationObserver) {
      var revealChanges = new MutationObserver(function (mutations) {
        mutations.forEach(function (change) {
          change.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1 || (node.closest && node.closest(".lightbox"))) return;
            bindReveal(node);
          });
        });
      });
      revealChanges.observe(revealRoot, { childList: true, subtree: true });
    }

    window.setTimeout(function () {
      loaderDone = true;
      waitQueue.splice(0).forEach(arm);
    }, loader ? 2200 : 60);
  }
})();
