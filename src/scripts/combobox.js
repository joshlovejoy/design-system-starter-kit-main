(function () {
  function setOpen(wrap, open) {
    wrap.classList.toggle('slds-is-open', open);
    wrap.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function wireCombobox(id) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const trigger = document.getElementById(id + '-value');
    const listbox = document.getElementById(id + '-listbox');
    const valueSpan = trigger.querySelector('.slds-truncate');
    function outsideClick(e) {
      if (!wrap.contains(e.target)) setOpen(wrap, false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(wrap, false);
    }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(wrap, !wrap.classList.contains('slds-is-open'));
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(wrap, !wrap.classList.contains('slds-is-open'));
      }
      if (e.key === 'ArrowDown') {
        setOpen(wrap, true);
        listbox && listbox.focus && listbox.focus();
      }
    });
    listbox.addEventListener('click', function (e) {
      const opt = e.target.closest('[role="option"]');
      if (!opt) return;
      listbox.querySelectorAll('[role="option"]').forEach(function (el) {
        el.setAttribute('aria-selected', 'false');
      });
      opt.setAttribute('aria-selected', 'true');
      valueSpan.textContent = opt.dataset.value || opt.textContent.trim();
      setOpen(wrap, false);
      wrap.dispatchEvent(new CustomEvent('comboboxchange', { detail: { value: valueSpan.textContent } }));
    });
    document.addEventListener('click', outsideClick);
    document.addEventListener('keydown', onKey);
  }
  window.initCombobox = wireCombobox;
})();
