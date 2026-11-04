/* ============================================================
   PAWSITIVE.LIVING — Interactive features
   Ritual finder quiz · Product image zoom
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

/* ---------- Ritual finder quiz ---------- */
  $$('[data-quiz]').forEach(function (quiz) {
    var config = JSON.parse($('[data-quiz-config]', quiz).textContent);
    var steps = $$('[data-quiz-step]', quiz);
    var result = $('[data-quiz-result]', quiz);
    var nextBtn = $('[data-quiz-next]', quiz);
    var backBtn = $('[data-quiz-back]', quiz);
    var progress = $('[data-quiz-progress]', quiz);
    var current = 0;
    var answers = {};

    function showStep(i) {
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      result.hidden = true;
      nextBtn.hidden = false;
      backBtn.hidden = i === 0;
      nextBtn.disabled = !answers[i];
      nextBtn.textContent = nextBtn.dataset.label || nextBtn.textContent;
      progress.textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      current = i;
    }

    function showResult() {
      // Tally scores; highest wins, ties go to bundle
      var scores = { paw: 0, coat: 0, bundle: 0 };
      Object.keys(answers).forEach(function (k) {
        var v = answers[k];
        if (scores[v] !== undefined) scores[v]++;
      });
      var winner = 'bundle';
      var best = -1;
      ['paw', 'coat', 'bundle'].forEach(function (k) {
        if (scores[k] > best) { best = scores[k]; winner = k; }
      });

      var p = config.products[winner];
      var r = config.results[winner];
      $('[data-quiz-result-title]', result).textContent = r.title;
      $('[data-quiz-result-text]', result).textContent = r.text;
      var prodHtml = '';
      if (p && p.url) {
        prodHtml = '<a class="quiz__product-card" href="' + p.url + '">' +
          (p.image ? '<img src="' + p.image + '" alt="' + (p.title || '').replace(/"/g, '&quot;') + '" loading="lazy">' : '') +
          '<span class="quiz__product-info"><strong>' + (p.title || '') + '</strong>' +
          (p.price ? '<span>' + p.price + '</span>' : '') + '</span></a>';
      }
      $('[data-quiz-result-product]', result).innerHTML = prodHtml;

      steps.forEach(function (s) { s.hidden = true; });
      result.hidden = false;
      nextBtn.hidden = true;
      backBtn.hidden = true;
      progress.textContent = '';
    }

    quiz.addEventListener('change', function (e) {
      if (!e.target.matches('[data-quiz-input]')) return;
      var step = e.target.closest('[data-quiz-step]');
      var idx = steps.indexOf(step);
      answers[idx] = e.target.value;
      if (idx === current) nextBtn.disabled = false;
    });

    nextBtn.addEventListener('click', function () {
      if (current < steps.length - 1) showStep(current + 1);
      else showResult();
    });
    backBtn.addEventListener('click', function () {
      if (current > 0) showStep(current - 1);
    });
    var restart = $('[data-quiz-restart]', quiz);
    if (restart) restart.addEventListener('click', function () {
      answers = {};
      $$('[data-quiz-input]', quiz).forEach(function (i) { i.checked = false; });
      showStep(0);
    });

    if (steps.length) showStep(0);
  });

  /* ---------- Product image zoom (hover) ---------- */
  $$('.product__featured').forEach(function (wrap) {
    var img = wrap.querySelector('img');
    if (!img) return;
    wrap.classList.add('zoomable');
    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
    });
    wrap.addEventListener('mouseenter', function () {
      img.style.transform = 'scale(1.8)';
    });
    wrap.addEventListener('mouseleave', function () {
      img.style.transform = '';
      img.style.transformOrigin = 'center';
    });
  });
})();
