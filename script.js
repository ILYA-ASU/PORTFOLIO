// ============================================================
// КАРТИНКИ ДЛЯ 5 ГАЛЕРЕЙ
// ============================================================
var IMAGE_SETS = {
    set1: [
        'images/kvant1.png', 'images/kvant2.png', 'images/kvant3.png', 'images/kvant4.png',
        'images/kvant5.png', 'images/kvant6.png', 'images/kvant7.png', 'images/kvant8.png',
        'images/kvant9.png', 'images/kvant10.png'
    ],
    set2: [
        'images/Betonstal/Рисунок1.png', 'images/Betonstal/Рисунок2.png', 'images/Betonstal/Рисунок3.png',
        'images/Betonstal/Рисунок4.png', 'images/Betonstal/Рисунок5.png', 'images/Betonstal/Рисунок6.png',
        'images/Betonstal/Рисунок7.png', 'images/Betonstal/Рисунок8.png', 'images/Betonstal/Рисунок9.png',
        'images/Betonstal/status.png'
    ],
    set3: [
        'images/PR200/Рисунок1.png', 'images/PR200/Рисунок2.png', 'images/PR200/Рисунок3.png',
        'images/PR200/Рисунок4.png', 'images/PR200/Рисунок5.png', 'images/PR200/Статусы.png',
        'images/kvant7.png', 'images/kvant8.png', 'images/kvant9.png', 'images/kvant10.png'
    ],
    set4: [
        'images/Dalgakiran/Dalgakiran1.png', 'images/Dalgakiran/Dalgakiran2.png',
        'images/Dalgakiran/Dalgakiran3.png', 'images/Dalgakiran/Dalgakiran4.png',
        'images/Dalgakiran/Dalgakiran5.png',
        'images/kvant6.png', 'images/kvant7.png', 'images/kvant8.png', 'images/kvant9.png', 'images/kvant10.png'
    ],
    set5: [
        'images/kvant1.png', 'images/kvant2.png', 'images/kvant3.png', 'images/kvant4.png',
        'images/kvant5.png', 'images/kvant6.png', 'images/kvant7.png', 'images/kvant8.png',
        'images/kvant9.png', 'images/kvant10.png'
    ]
};

var SET_TITLES = {
    set1: 'KVANT',
    set2: 'BETONSTAL',
    set3: 'PR200',
    set4: 'DALGAKIRAN',
    set5: 'KVANT'
};

// ============================================================
// ПАЛИТРА
// ============================================================
var PALETTE = [
    [[0, 220, 255],   [123, 123, 255]],
    [[255, 120, 180], [180, 80, 255]],
    [[120, 255, 180], [0, 200, 255]],
    [[255, 200, 100], [255, 100, 130]],
    [[160, 140, 255], [80, 220, 255]],
    [[255, 90, 140],  [255, 180, 80]],
    [[100, 220, 255], [200, 120, 255]],
    [[180, 255, 130], [60, 200, 220]]
];

// ============================================================
// ЭЛЕМЕНТЫ
// ============================================================
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');
var curtain = document.getElementById('curtain');

// ============================================================
// СОСТОЯНИЕ
// ============================================================
var currentSection = 0;
var isTransitioning = false;
var lastPaletteIndex = -1;

// ============================================================
// ПАЛИТРА
// ============================================================
function applyRandomPalette() {
    var idx;
    do {
        idx = Math.floor(Math.random() * PALETTE.length);
    } while (idx === lastPaletteIndex && PALETTE.length > 1);
    lastPaletteIndex = idx;

    var a = PALETTE[idx][0];
    var b = PALETTE[idx][1];

    document.body.style.setProperty('--accent-rgb', a.join(', '));
    document.body.style.setProperty('--accent2-rgb', b.join(', '));

    if (window.__bgSetAccent) {
        window.__bgSetAccent(a, b);
    }
}

// ============================================================
// КЛАСС СЛОЯ КАРТОЧЕК
// ============================================================
function CardsLayer(container, images, key, title) {
    this.container = container;
    this.images = images;
    this.key = key;
    this.title = title || 'PROJECT';
    this.counter = document.querySelector('[data-counter="' + key + '"]');
    this._build();
}

CardsLayer.prototype._build = function () {
    var self = this;
    var total = this.images.length;
    var half = Math.ceil(total / 2);

    // ---------- ПАРАМЕТРЫ РАСКЛАДКИ ----------
    // Разбиваем половину экрана на 5 слотов по вертикали.
    // Внутри слота — небольшой случайный сдвиг, чтобы не выстраивать линию.
    var TOP_LIMIT    = 16;    // % от верха сцены (центр первой карточки)
    var BOTTOM_LIMIT = 78;    // % от верха сцены (центр последней карточки)
    var JITTER       = 4;     // % случайного сдвига внутри слота

    // Горизонтальные зоны (центр карточки)
    var X_LEFT_MIN  = 16;     // % слева
    var X_LEFT_MAX  = 32;
    var X_RIGHT_MIN = 68;
    var X_RIGHT_MAX = 84;

       // Размер карточки — зависит от ширины экрана
    var screenW = window.innerWidth;
    var SIZE_MIN, SIZE_MAX;

    if (screenW < 480) {
        SIZE_MIN = 65;
        SIZE_MAX = 85;
    } else if (screenW < 768) {
        SIZE_MIN = 75;
        SIZE_MAX = 100;
    } else if (screenW < 1024) {
        SIZE_MIN = 100;
        SIZE_MAX = 130;
    } else {
        SIZE_MIN = 110;
        SIZE_MAX = 150;
    }

    // ---------- РАСКЛАДКА ----------
    // Делим на левую/правую группу
    var leftImages  = [];
    var rightImages = [];
    this.images.forEach(function (src, i) {
        if (i < half) leftImages.push({ src: src, index: i });
        else          rightImages.push({ src: src, index: i });
    });

    // Раскладываем каждую группу
    layoutGroup(leftImages, true);
    layoutGroup(rightImages, false);

    // ---------- ФУНКЦИЯ РАСКЛАДКИ ОДНОЙ СТОРОНЫ ----------
    function layoutGroup(group, isLeft) {
        var count = group.length;
        if (count === 0) return;

        // Слоты по вертикали: 0..count-1
        // Если карточек больше слотов не хватает — распределяем равномерно
        var slotStep = count > 1
            ? (BOTTOM_LIMIT - TOP_LIMIT) / (count - 1)
            : 0;

        // Перемешиваем порядок карточек, чтобы номера не шли строго сверху-вниз
        var shuffled = group.slice();
        for (var k = shuffled.length - 1; k > 0; k--) {
            var r = Math.floor(Math.random() * (k + 1));
            var tmp = shuffled[k];
            shuffled[k] = shuffled[r];
            shuffled[r] = tmp;
        }

        shuffled.forEach(function (item, slotIdx) {
            var src = item.src;
            var cardIndex = item.index;
            var numStr = String(cardIndex + 1).padStart(2, '0');

            // ---------- ПОЗИЦИЯ ПО Y ----------
            // Базовый слот + случайный сдвиг
            var baseY = TOP_LIMIT + slotIdx * slotStep;
            var jitter = (Math.random() - 0.5) * 2 * JITTER;
            var yPercent = baseY + jitter;

            // Не выходим за границы
            yPercent = Math.max(TOP_LIMIT - JITTER, Math.min(BOTTOM_LIMIT + JITTER, yPercent));

            // ---------- ПОЗИЦИЯ ПО X ----------
            var xPercent;
            if (isLeft) {
                xPercent = X_LEFT_MIN + Math.random() * (X_LEFT_MAX - X_LEFT_MIN);
            } else {
                xPercent = X_RIGHT_MIN + Math.random() * (X_RIGHT_MAX - X_RIGHT_MIN);
            }

            // ---------- РАЗМЕР ----------
            var size = SIZE_MIN + Math.floor(Math.random() * (SIZE_MAX - SIZE_MIN));

            // ---------- НАКЛОН ----------
            var rotate = (Math.random() - 0.5) * 70;   // -35° .. +35°

            // ---------- ЗАДЕРЖКА ЛЕВИТАЦИИ ----------
            var delay = (Math.random() * 6).toFixed(2);
            var duration = (4 + Math.random() * 4).toFixed(2);

            // ---------- СОЗДАЁМ КАРТОЧКУ ----------
            var card = document.createElement('div');
            card.className = 'card';

            var img = document.createElement('img');
            img.src = src;
            img.alt = self.title + ' ' + numStr;
            img.draggable = false;
            img.loading = 'lazy';

            var overlay = document.createElement('div');
            overlay.className = 'card-overlay';
            overlay.innerHTML =
                '<div class="card-num">' + numStr + '</div>' +
                '<div class="card-title">' +
                    '<span class="card-title-label">PROJECT</span>' +
                    '<span class="card-title-name">' + self.title + ' — ' + numStr + '</span>' +
                '</div>';

            card.appendChild(img);
            card.appendChild(overlay);

            // Размеры
            card.style.width  = size + 'px';
            card.style.height = size + 'px';

            // Позиция — от центра
            card.style.left = 'calc(' + xPercent + '% - ' + (size / 2) + 'px)';
            card.style.top  = 'calc(' + yPercent + '% - ' + (size / 2) + 'px)';

            // CSS-переменные
            card.style.setProperty('--rotate', rotate.toFixed(2) + 'deg');
            card.style.setProperty('--delay', delay + 's');
            card.style.animationDuration = duration + 's';

            // Hover → лайтбокс через 1 сек
            var hoverTimer = null;
            var isHovered = false;

            card.addEventListener('mouseenter', function () {
                isHovered = true;
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(function () {
                    if (!isHovered) return;
                    lightboxImg.src = src;
                    lightbox.classList.add('show');
                }, 1000);
            });

            card.addEventListener('mouseleave', function () {
                isHovered = false;
                clearTimeout(hoverTimer);
                lightbox.classList.remove('show');
            });

            // Тап по карточке (для тач-устройств) — открыть лайтбокс
            card.addEventListener('click', function (e) {
                // Только на тач-устройствах
                if (!('ontouchstart' in window)) return;
                e.stopPropagation();
                lightboxImg.src = src;
                lightbox.classList.add('show');
            });

            self.container.appendChild(card);
        });
    }

    if (this.counter) {
        this.counter.textContent = '01 / ' + String(total).padStart(2, '0');
    }
};

// Пересборка при смене секции
CardsLayer.prototype.relayout = function () {
    this.container.innerHTML = '';
    this._build();
};

// ============================================================
// СОЗДАЁМ СЛОИ КАРТОЧЕК
// ============================================================
var layers = [];
['set1', 'set2', 'set3', 'set4', 'set5'].forEach(function (key, i) {
    var container = document.querySelector('.cards-layer[data-images="' + key + '"]');
    if (container) {
        layers[i] = new CardsLayer(container, IMAGE_SETS[key], key, SET_TITLES[key]);
    }
});

// ============================================================
// ОБЁРТКА СЕКЦИЙ
// ============================================================
var allSections = Array.prototype.slice.call(document.querySelectorAll('.section'));

var sectionsWrap = document.createElement('div');
sectionsWrap.className = 'sections-wrap';

allSections.forEach(function (s, i) {
    s.style.top = (i * 100) + 'vh';
    sectionsWrap.appendChild(s);
});

document.body.appendChild(sectionsWrap);

var sections = document.querySelectorAll('.section');
if (sections.length > 0) sections[0].classList.add('visible');

// ============================================================
// ТОЧКИ ПРОГРЕССА
// ============================================================
var dotsContainer = document.getElementById('progress-dots');
var dots = [];

if (dotsContainer) {
    dotsContainer.innerHTML = '';
    sections.forEach(function (_, i) {
        var d = document.createElement('span');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        dotsContainer.appendChild(d);
    });
    dots = document.querySelectorAll('#progress-dots .dot');
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ
// ============================================================
function goToSection(index) {
    if (isTransitioning || index === currentSection) return;
    if (index < 0 || index >= sections.length) return;

    isTransitioning = true;

    lightbox.classList.remove('show');

    applyRandomPalette();

    curtain.classList.add('active');

    setTimeout(function () {
        currentSection = index;
        sectionsWrap.style.transform = 'translateY(-' + (index * 100) + 'vh)';

        sections.forEach(function (s, i) {
            s.classList.toggle('visible', i === index);
        });

        if (dots.length) {
            dots.forEach(function (d, i) {
                d.classList.toggle('active', i === index);
            });
        }

        // Пересобираем карточки новой секции
        if (layers[index] && typeof layers[index].relayout === 'function') {
            layers[index].relayout();
        }

        setTimeout(function () {
            curtain.classList.remove('active');
            setTimeout(function () {
                isTransitioning = false;
            }, 600);
        }, 250);
    }, 550);
}

// ============================================================
// КОЛЕСО
// ============================================================
var wheelAccum = 0;
var wheelResetTimer = null;

window.addEventListener('wheel', function (e) {
    if (isTransitioning) return;

    if (lightbox.classList.contains('show')) {
        lightbox.classList.remove('show');
        return;
    }

    wheelAccum += e.deltaY;
    clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(function () {
        wheelAccum = 0;
    }, 220);

    var SWITCH_THRESHOLD = 80;

    if (wheelAccum > SWITCH_THRESHOLD && currentSection < sections.length - 1) {
        wheelAccum = 0;
        goToSection(currentSection + 1);
        return;
    }
    if (wheelAccum < -SWITCH_THRESHOLD && currentSection > 0) {
        wheelAccum = 0;
        goToSection(currentSection - 1);
        return;
    }
}, { passive: true });

// ============================================================
// СВАЙП МЕЖДУ СЕКЦИЯМИ (для тач-устройств)
// ============================================================
(function initTouchSwipe() {
    var touchStartY = 0;
    var touchStartX = 0;
    var touchStartTime = 0;
    var touchMoved = false;
    var SWIPE_THRESHOLD = 60;      // минимальный сдвиг в px
    var SWIPE_TIME_MAX = 700;      // максимум мс на жест
    var LOCK_TIME = 950;           // блокировка во время перехода

    var lastSwitch = 0;

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        touchMoved = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        if (e.touches.length !== 1) return;
        var dy = e.touches[0].clientY - touchStartY;
        var dx = e.touches[0].clientX - touchStartX;
        if (Math.abs(dy) > 10 || Math.abs(dx) > 10) touchMoved = true;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (!touchMoved) return;   // это был тап, не свайп
        if (isTransitioning) return;

        // Блокировка от частых переключений
        var now = Date.now();
        if (now - lastSwitch < LOCK_TIME) return;

        // Если лайтбокс открыт — закрываем его свайпом
        if (lightbox.classList.contains('show')) {
            lightbox.classList.remove('show');
            return;
        }

        var touch = e.changedTouches[0];
        var dy = touch.clientY - touchStartY;
        var dx = touch.clientX - touchStartX;
        var dt = Date.now() - touchStartTime;

        if (dt > SWIPE_TIME_MAX) return;

        // Проверяем — вертикальный это свайп или горизонтальный
        if (Math.abs(dy) > Math.abs(dx)) {
            // Вертикальный свайп — переключаем секции
            if (dy < -SWIPE_THRESHOLD && currentSection < sections.length - 1) {
                lastSwitch = now;
                goToSection(currentSection + 1);
            } else if (dy > SWIPE_THRESHOLD && currentSection > 0) {
                lastSwitch = now;
                goToSection(currentSection - 1);
            }
        }
    }, { passive: true });
})();

// ============================================================
// ФОН (матрица + сетка)
// ============================================================
(function initBackground() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d', { alpha: false });
    var W = 0;
    var H = 0;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    resize();
    window.addEventListener('resize', resize);

    var accent = [0, 220, 255];
    var accent2 = [123, 123, 255];

    window.__bgSetAccent = function (a, b) {
        accent = a;
        accent2 = b;
    };

    var mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, active: false };
    window.addEventListener('mousemove', function (e) {
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', function () {
        mouse.active = false;
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    var FONT_SIZE = 18;
    var drops = [];
    var CHARS = '01アイウエオカキクケコサシスセソタチツテト0123456789<>/\\[]{}()=+*';

    function initMatrix() {
        var columns = Math.floor(W / FONT_SIZE);
        drops = [];
        for (var i = 0; i < columns; i++) {
            var chars = [];
            for (var k = 0; k < 18; k++) {
                chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
            }
            drops.push({
                y: Math.random() * -H,
                speed: 0.6 + Math.random() * 1.2,
                chars: chars
            });
        }
    }
    initMatrix();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initMatrix, 250);
    });

    var traces = [];
    for (var t = 0; t < 4; t++) {
        traces.push({
            y: Math.random() * H,
            speed: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.8),
            length: 100 + Math.random() * 250,
            x: Math.random() * W
        });
    }

    var glitches = [];
    var scanY = 0;
    var lastTime = performance.now();
    var FRAME_INTERVAL = 1000 / 40;
    var accum = 0;

    function draw(now) {
        requestAnimationFrame(draw);
        var dt = now - lastTime;
        lastTime = now;
        accum += dt;
        if (accum < FRAME_INTERVAL) return;
        accum = 0;

        mouse.x = lerp(mouse.x, mouse.tx, 0.1);
        mouse.y = lerp(mouse.y, mouse.ty, 0.1);

        ctx.fillStyle = '#04040a';
        ctx.fillRect(0, 0, W, H);

        // Сетка
        ctx.strokeStyle = 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.08)';
        ctx.lineWidth = 1;
        var horizon = H * 0.55;
        var gridLines = 18;

        ctx.beginPath();
        for (var i = 0; i <= gridLines; i++) {
            var a = (i / gridLines - 0.5) * Math.PI * 0.9;
            ctx.moveTo(W / 2 + Math.tan(a) * W * 0.02, horizon);
            ctx.lineTo(W / 2 + Math.tan(a) * W * 1.2, H + 50);
        }
        ctx.stroke();

        ctx.beginPath();
        for (var j = 0; j < 12; j++) {
            var tt = j / 12;
            var y = horizon + Math.pow(tt, 1.8) * (H - horizon + 50);
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
        }
        ctx.stroke();

        // Верхняя подсветка
        var topGlow = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        topGlow.addColorStop(0, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.07)');
        topGlow.addColorStop(1, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, W, H * 0.5);

        // Матрица
        ctx.font = 'bold ' + FONT_SIZE + 'px "Courier New", monospace';
        ctx.textBaseline = 'top';

        for (var m = 0; m < drops.length; m++) {
            var dr = drops[m];
            var x = m * FONT_SIZE;
            for (var n = 0; n < dr.chars.length; n++) {
                var cy = dr.y - n * FONT_SIZE;
                if (cy < -FONT_SIZE || cy > H + FONT_SIZE) continue;
                if (n > 8 && Math.random() > 0.3) continue;
                var fade = 1 - n / dr.chars.length;
                var color;
                if (n === 0) {
                    color = 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + (0.9 * fade) + ')';
                } else if (n < 4) {
                    color = 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + (0.5 * fade) + ')';
                } else {
                    color = 'rgba(' + accent2[0] + ',' + accent2[1] + ',' + accent2[2] + ',' + (0.2 * fade) + ')';
                }
                ctx.fillStyle = color;
                ctx.fillText(dr.chars[n], x, cy);
            }
            dr.y += dr.speed;
            if (dr.y - dr.chars.length * FONT_SIZE > H) {
                dr.y = Math.random() * -200;
                dr.speed = 0.6 + Math.random() * 1.2;
            }
        }

        // Трассы
        ctx.lineCap = 'round';
        for (var k = 0; k < traces.length; k++) {
            var tr = traces[k];
            tr.x += tr.speed;
            if (tr.x - tr.length > W) tr.x = -tr.length;
            if (tr.x + tr.length < 0) tr.x = W + tr.length;

            var grd = ctx.createLinearGradient(tr.x - tr.length, 0, tr.x, 0);
            grd.addColorStop(0, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0)');
            grd.addColorStop(0.7, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.5)');
            grd.addColorStop(1, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.95)');

            ctx.strokeStyle = grd;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(tr.x - tr.length, tr.y);
            ctx.lineTo(tr.x, tr.y);
            ctx.stroke();
        }

        // Глитчи
        if (Math.random() < 0.025) {
            glitches.push({
                y: Math.random() * H,
                h: 1 + Math.random() * 3,
                life: 1
            });
        }
        for (var g = glitches.length - 1; g >= 0; g--) {
            var gl = glitches[g];
            ctx.fillStyle = 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + (gl.life * 0.35) + ')';
            ctx.fillRect(0, gl.y, W, gl.h);
            gl.life -= 0.14;
            if (gl.life <= 0) glitches.splice(g, 1);
        }

        // Сканлайн
        scanY += 1.2;
        if (scanY > H) scanY = 0;
        var scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        scanGrad.addColorStop(0, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0)');
        scanGrad.addColorStop(0.5, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.07)');
        scanGrad.addColorStop(1, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 30, W, 60);

        // Ореол мыши
        if (mouse.active) {
            var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
            grad.addColorStop(0, 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',0.1)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }
    }

    requestAnimationFrame(draw);
})();

// ============================================================
// ЛЕПЕСТКИ
// ============================================================
(function initSakuraPetals() {
    var canvas = document.getElementById('sakura-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W = 0;
    var H = 0;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    resize();
    window.addEventListener('resize', resize);

    var PETAL_COUNT = 50;
    var petals = [];

    function makePetal(initial) {
        return {
            x: Math.random() * W,
            y: initial ? Math.random() * H : -30,
            size: 8 + Math.random() * 12,
            vy: 0.5 + Math.random() * 1.0,
            vx: (Math.random() - 0.5) * 0.8,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.08,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.03,
            hue: Math.random() > 0.5 ? 'pink' : 'light',
            alpha: 0.7 + Math.random() * 0.3
        };
    }

    for (var i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        var s = p.size;
        var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
        if (p.hue === 'pink') {
            grad.addColorStop(0, 'rgba(255, 200, 230, ' + p.alpha + ')');
            grad.addColorStop(0.55, 'rgba(255, 140, 190, ' + (p.alpha * 0.9) + ')');
            grad.addColorStop(1, 'rgba(255, 90, 150, 0)');
        } else {
            grad.addColorStop(0, 'rgba(255, 240, 250, ' + p.alpha + ')');
            grad.addColorStop(0.55, 'rgba(255, 190, 225, ' + (p.alpha * 0.9) + ')');
            grad.addColorStop(1, 'rgba(255, 140, 190, 0)');
        }
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.75, -s * 0.7, s * 0.75, s * 0.45, 0, s * 0.65);
        ctx.bezierCurveTo(-s * 0.75, s * 0.45, -s * 0.75, -s * 0.7, 0, -s * 0.5);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (p.alpha * 0.5) + ')';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35);
        ctx.lineTo(0, s * 0.55);
        ctx.stroke();

        ctx.restore();
    }

    var lastTime = performance.now();
    var FRAME_INTERVAL = 1000 / 30;
    var accum = 0;

    function draw(now) {
        requestAnimationFrame(draw);
        var dt = now - lastTime;
        lastTime = now;
        accum += dt;
        if (accum < FRAME_INTERVAL) return;
        accum = 0;

        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < petals.length; i++) {
            var p = petals[i];
            p.sway += p.swaySpeed;
            p.x += p.vx + Math.sin(p.sway) * 0.8;
            p.y += p.vy;
            p.angle += p.spin;

            if (p.y > H + 40) {
                var fresh = makePetal(false);
                p.x = fresh.x; p.y = fresh.y; p.size = fresh.size;
                p.vy = fresh.vy; p.vx = fresh.vx; p.angle = fresh.angle;
                p.spin = fresh.spin; p.sway = fresh.sway;
                p.swaySpeed = fresh.swaySpeed; p.hue = fresh.hue; p.alpha = fresh.alpha;
            }
            if (p.x < -40) p.x = W + 40;
            if (p.x > W + 40) p.x = -40;

            drawPetal(p);
        }
    }

    requestAnimationFrame(draw);
})();

// ============================================================
// КНОПКА "СВЯЗАТЬСЯ"
// ============================================================
(function initContactButton() {
    var btn = document.getElementById('contact-btn');
    var modal = document.getElementById('contact-modal');
    var modalClose = document.getElementById('contact-modal-close');

    if (!btn || !modal) return;

    var clickState = 0;
    var busy = false;

    function spawnFlash(x, y) {
        var ring = document.createElement('div');
        ring.className = 'teleport-ring';
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
        document.body.appendChild(ring);
        setTimeout(function () {
            if (ring.parentNode) ring.parentNode.removeChild(ring);
        }, 700);

        setTimeout(function () {
            var ring2 = document.createElement('div');
            ring2.className = 'teleport-ring';
            ring2.style.left = x + 'px';
            ring2.style.top = y + 'px';
            ring2.style.width = '50px';
            ring2.style.height = '50px';
            ring2.style.animationDelay = '0.08s';
            document.body.appendChild(ring2);
            setTimeout(function () {
                if (ring2.parentNode) ring2.parentNode.removeChild(ring2);
            }, 700);
        }, 40);

        var core = document.createElement('div');
        core.className = 'teleport-core';
        core.style.left = x + 'px';
        core.style.top = y + 'px';
        document.body.appendChild(core);
        setTimeout(function () {
            if (core.parentNode) core.parentNode.removeChild(core);
        }, 550);

        for (var i = 0; i < 10; i++) {
            var spark = document.createElement('div');
            spark.className = 'teleport-spark';
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
            var angle = (i / 10) * Math.PI * 2;
            var dist = 50 + Math.random() * 80;
            spark.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            spark.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            document.body.appendChild(spark);
            (function (el) {
                setTimeout(function () {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 650);
            })(spark);
        }
    }

    function randomSpot() {
        var rect = btn.getBoundingClientRect();
        var btnW = rect.width || 160;
        var btnH = rect.height || 50;
        var padding = 60;

        var maxX = window.innerWidth - btnW - padding;
        var maxY = window.innerHeight - btnH - padding;

        var x = padding + Math.random() * Math.max(1, maxX - padding);
        var y = padding + Math.random() * Math.max(1, maxY - padding);

        if (x > maxX - 240 && y < 140) {
            x = padding + Math.random() * Math.max(1, (maxX - padding) * 0.55);
        }
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;
        if (Math.abs(x - cx) < 200 && Math.abs(y - cy) < 200) {
            y = y < cy ? y - 180 : y + 180;
            y = Math.max(padding, Math.min(maxY, y));
        }

        return { x: x, y: y };
    }

    function teleportTo(x, y) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        spawnFlash(cx, cy);

        setTimeout(function () {
            btn.classList.add('teleporting-out');
        }, 60);

        setTimeout(function () {
            btn.style.left = x + 'px';
            btn.style.top = y + 'px';
            btn.style.right = 'auto';

            btn.classList.remove('teleporting-out');

            var newRect = btn.getBoundingClientRect();
            spawnFlash(
                newRect.left + newRect.width / 2,
                newRect.top + newRect.height / 2
            );

            setTimeout(function () {
                btn.classList.add('teleporting-in');

                setTimeout(function () {
                    btn.classList.remove('teleporting-in');
                    busy = false;
                }, 450);
            }, 80);
        }, 380);
    }

    function teleportHome() {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        spawnFlash(cx, cy);

        setTimeout(function () {
            btn.classList.add('teleporting-out');
        }, 60);

        setTimeout(function () {
            btn.style.left = 'auto';
            btn.style.top = '30px';
            btn.style.right = '30px';

            btn.classList.remove('teleporting-out');

            var newRect = btn.getBoundingClientRect();
            spawnFlash(
                newRect.left + newRect.width / 2,
                newRect.top + newRect.height / 2
            );

            setTimeout(function () {
                btn.classList.add('teleporting-in');

                setTimeout(function () {
                    btn.classList.remove('teleporting-in');
                    busy = false;
                }, 450);
            }, 80);
        }, 380);
    }

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (busy) return;
        busy = true;

        if (clickState === 0) {
            clickState = 1;
            var spot = randomSpot();
            teleportTo(spot.x, spot.y);
        } else {
            clickState = 0;
            teleportHome();

            setTimeout(function () {
                modal.classList.add('show');
            }, 700);
        }
    });

    function closeModal() {
        modal.classList.remove('show');
        clickState = 0;
        btn.style.left = 'auto';
        btn.style.top = '30px';
        btn.style.right = '30px';
        btn.classList.remove('teleporting-out', 'teleporting-in');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
})();

// ============================================================
// КНОПКА "МУЗЫКА"
// ============================================================
(function initMusicButton() {
    var btn = document.getElementById('music-btn');
    var icon = document.getElementById('music-btn-icon');
    var audio = document.getElementById('bg-music');

    if (!btn || !audio || !icon) return;

    var isPlaying = false;
    audio.volume = 0.6;

    btn.addEventListener('click', function () {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            btn.classList.remove('playing');
            icon.textContent = '▶';
        } else {
            var playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    isPlaying = true;
                    btn.classList.add('playing');
                    icon.textContent = '▮▮';
                }).catch(function (err) {
                    console.warn('Не удалось воспроизвести:', err);
                });
            } else {
                isPlaying = true;
                btn.classList.add('playing');
                icon.textContent = '▮▮';
            }
        }
    });

    audio.addEventListener('ended', function () {
        isPlaying = false;
        btn.classList.remove('playing');
        icon.textContent = '▶';
    });
})();

// ============================================================
// КНОПКА "ОБО МНЕ"
// ============================================================
(function initAboutButton() {
    var btn = document.getElementById('about-btn');
    var modal = document.getElementById('about-modal');
    var modalClose = document.getElementById('about-modal-close');

    if (!btn || !modal) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        modal.classList.add('show');
    });

    function closeModal() {
        modal.classList.remove('show');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
})();

// ============================================================
// ЗАКРЫТИЕ ЛАЙТБОКСА ТАПОМ ПО ЭКРАНУ (для тач-устройств)
// ============================================================
(function initLightboxTouchClose() {
    if (!('ontouchstart' in window)) return;

    document.addEventListener('click', function (e) {
        if (!lightbox.classList.contains('show')) return;
        // Если тап не по карточке — закрываем лайтбокс
        if (!e.target.closest('.card')) {
            lightbox.classList.remove('show');
        }
    });
})();