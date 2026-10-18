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
    }

    paintFilters();
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
      if (valid) window.location.href = "thank-you.html";
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

  var storyPhotos = document.querySelectorAll(".story__photo img");
  var storyCopies = document.querySelectorAll(".story__copy");
  var heroCopies = document.querySelectorAll(".hero__copy");
  if (storyPhotos.length || storyCopies.length || heroCopies.length) {
    storyPhotos.forEach(function (img, index) {
      img.classList.add(index % 2 === 0 ? "reveal-right" : "reveal-left");
    });
    storyCopies.forEach(function (copy) {
      copy.classList.add("reveal-copy");
    });
    heroCopies.forEach(function (copy) {
      copy.classList.add("reveal-copy");
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    requestAnimationFrame(function () {
      storyPhotos.forEach(function (img) { revealObserver.observe(img); });
      storyCopies.forEach(function (copy) { revealObserver.observe(copy); });
      heroCopies.forEach(function (copy) { revealObserver.observe(copy); });
    });
  }
})();
