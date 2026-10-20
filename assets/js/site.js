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
  var projectsRoot = document.querySelector("[data-projects]");

  function initCategoryTabs(categories, onShow) {
    var filters = document.querySelector("[data-filters]");
    if (!filters || !categories || !categories.length) return;

    var all = document.createElement("button");
    all.type = "button";
    all.textContent = "All";
    all.dataset.slug = "all";
    filters.appendChild(all);
    categories.forEach(function (group) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = group.label;
      button.dataset.slug = group.slug;
      filters.appendChild(button);
    });

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
      if (!filterDots) return;
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
      if (filterPrev) filterPrev.disabled = page <= 0;
      if (filterNext) filterNext.disabled = page >= count - 1;
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

    function show(slug) {
      var current = slug || "all";
      filters.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.slug === current ? "true" : "false");
      });
      onShow(current);
      showActiveFilter();
    }

    filters.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      location.hash = button.dataset.slug === "all" ? "" : button.dataset.slug;
      show(button.dataset.slug);
    });

    if (filterPrev) filterPrev.addEventListener("click", function () { moveFilters(filterPage - 1); });
    if (filterNext) filterNext.addEventListener("click", function () { moveFilters(filterPage + 1); });
    window.addEventListener("resize", function () { moveFilters(filterPage); });
    moveFilters(0);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveFilters(filterPage); });
    }

    var hash = location.hash.replace("#", "");
    var known = categories.some(function (group) {
      return group.slug === hash;
    });
    show(known ? hash : "all");
    window.addEventListener("hashchange", function () {
      var next = location.hash.replace("#", "");
      var exists = categories.some(function (group) {
        return group.slug === next;
      });
      show(exists ? next : "all");
    });
  }

  if (galleryRoot && window.ROAA_GALLERY) {
    initCategoryTabs(window.ROAA_GALLERY, function (current) {
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
      if (window.ROAAReveal) window.ROAAReveal(galleryRoot);
    });
  }

  if (projectsRoot && window.ROAA_PROJECT_CATEGORIES && window.ROAA_PROJECTS) {
    var corporateSubSlug = "";

    function appendList(section, items) {
      var list = document.createElement("ul");
      list.className = "list";
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      section.appendChild(list);
    }

    function appendGroupBlock(section, block, withHeading) {
      if (withHeading) {
        var heading = document.createElement("h3");
        heading.textContent = block.title;
        section.appendChild(heading);
      }
      if (block.lede) {
        var lede = document.createElement("p");
        lede.className = "lede";
        lede.textContent = block.lede;
        section.appendChild(lede);
      }
      if (block.items && block.items.length) appendList(section, block.items);
    }

    function renderCorporateGroup(block) {
      var wrap = document.createElement("div");
      wrap.className = "project-subgroup";
      appendGroupBlock(wrap, block, false);
      return wrap;
    }

    function renderProjectCategory(group, options) {
      var data = window.ROAA_PROJECTS[group.slug] || {};
      var section = document.createElement("section");
      section.className = "project-category section";
      section.id = group.slug;

      var title = document.createElement("h2");
      title.textContent = group.label + " Projects";
      section.appendChild(title);

      if (data.groups && data.groups.length) {
        if (options && options.subtabs) {
          var subtabs = document.createElement("div");
          subtabs.className = "filters filters--sub";
          subtabs.setAttribute("role", "tablist");
          subtabs.setAttribute("aria-label", group.label + " subcategories");

          var panel = document.createElement("div");
          panel.className = "project-subpanel";

          var initial = corporateSubSlug;
          var knownSub = data.groups.some(function (block) {
            return block.slug === initial;
          });
          if (!knownSub) initial = data.groups[0].slug;
          corporateSubSlug = initial;

          function showSub(slug) {
            corporateSubSlug = slug;
            subtabs.querySelectorAll("button").forEach(function (button) {
              var active = button.dataset.slug === slug;
              button.setAttribute("aria-pressed", active ? "true" : "false");
              button.setAttribute("aria-selected", active ? "true" : "false");
            });
            var block = data.groups.filter(function (entry) {
              return entry.slug === slug;
            })[0];
            panel.innerHTML = "";
            if (block) panel.appendChild(renderCorporateGroup(block));
            if (window.ROAAReveal) window.ROAAReveal(panel);
          }

          data.groups.forEach(function (block) {
            var button = document.createElement("button");
            button.type = "button";
            button.setAttribute("role", "tab");
            button.textContent = block.title;
            button.dataset.slug = block.slug;
            button.addEventListener("click", function () {
              showSub(block.slug);
            });
            subtabs.appendChild(button);
          });

          section.appendChild(subtabs);
          section.appendChild(panel);
          showSub(initial);
        } else {
          data.groups.forEach(function (block) {
            appendGroupBlock(section, block, true);
          });
        }
      } else if (data.items && data.items.length) {
        appendList(section, data.items);
      }

      return section;
    }

    initCategoryTabs(window.ROAA_PROJECT_CATEGORIES, function (current) {
      projectsRoot.innerHTML = "";
      window.ROAA_PROJECT_CATEGORIES.forEach(function (group) {
        if (current !== "all" && group.slug !== current) return;
        projectsRoot.appendChild(renderProjectCategory(group, {
          subtabs: current === group.slug && !!(window.ROAA_PROJECTS[group.slug] || {}).groups
        }));
      });
      if (window.ROAAReveal) window.ROAAReveal(projectsRoot);
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
      event.stopPropagation();
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
      if (submit) {
        submit.classList.add("is-sending");
        submit.disabled = true;
      }

      var endpoint = form.getAttribute("data-endpoint") || form.action;
      var thanksUrl = new URL("thank-you.html", window.location.href).href;

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          return response.text().then(function (text) {
            var payload = {};
            try { payload = JSON.parse(text); } catch (error) {}
            return { ok: response.ok, payload: payload, text: text };
          });
        })
        .then(function (result) {
          var payload = result.payload || {};
          var success = payload.success === true || payload.success === "true" || /submitted successfully/i.test(result.text || "");
          if (success) {
            window.location.replace(thanksUrl);
            return;
          }
          if (submit) {
            submit.classList.remove("is-sending");
            submit.disabled = false;
          }
          var note = payload.message || "Message could not be sent. Please try again.";
          if (/activation/i.test(note)) {
            note = "Check info@roaa-construction.com (and Spam) for a FormSubmit email, click “Activate Form”, then submit again.";
          }
          window.alert(note);
        })
        .catch(function () {
          if (submit) {
            submit.classList.remove("is-sending");
            submit.disabled = false;
          }
          window.alert("Message could not be sent. Please try again or email info@roaa-construction.com.");
        });
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
      ".section__head > .kicker",
      ".section__head > h2",
      ".section__head > .rule",
      ".section__head > .lede",
      ".stats__item",
      ".service",
      ".product-tile",
      ".project",
      ".ally",
      ".card",
      ".brand-card",
      ".story__copy",
      ".contact-card",
      ".filters",
      "section.section > h2",
      "section.section > ul",
      ".project-category > h2",
      ".project-category > h3",
      ".project-category > .lede",
      ".project-category > .list",
      ".project-category > .filters--sub",
      ".project-category > .project-subpanel",
      ".project-category > .actions",
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

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCount(node) {
      if (node.dataset.counted === "1") return;
      node.dataset.counted = "1";
      var target = Number(node.getAttribute("data-count")) || 0;
      var suffix = node.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function frame(now) {
        if (start === null) start = now;
        var progress = Math.min(1, (now - start) / duration);
        var value = Math.round(target * easeOutCubic(progress));
        node.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }

      node.textContent = "0" + suffix;
      requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.45 });
      counters.forEach(function (node) {
        countObserver.observe(node);
      });
    } else {
      counters.forEach(animateCount);
    }
  }
})();
