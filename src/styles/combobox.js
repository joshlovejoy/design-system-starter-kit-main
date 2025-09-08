(function () {
  function setOpen(wrap, open) {
    wrap.classList.toggle('slds-is-open', open);
    wrap.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  window.initCombobox = function (id) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const trigger = document.getElementById(id + '-value');
    const listbox = document.getElementById(id + '-listbox');
    const valueSpan = trigger.querySelector('.slds-truncate');

    function outside(e){ if(!wrap.contains(e.target)) setOpen(wrap,false); }
    function onKey(e){ if(e.key==='Escape') setOpen(wrap,false); }

    trigger.addEventListener('click', e => { e.stopPropagation(); setOpen(wrap, !wrap.classList.contains('slds-is-open')); });
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(wrap, !wrap.classList.contains('slds-is-open')); }
      if (e.key === 'ArrowDown') { setOpen(wrap, true); listbox && listbox.focus && listbox.focus(); }
    });
    listbox.addEventListener('click', e => {
      const opt = e.target.closest('[role="option"]'); if (!opt) return;
      listbox.querySelectorAll('[role="option"]').forEach(el => el.setAttribute('aria-selected','false'));
      opt.setAttribute('aria-selected','true');
      valueSpan.textContent = opt.dataset.value || opt.textContent.trim();
      setOpen(wrap,false);
    });
    document.addEventListener('click', outside);
    document.addEventListener('keydown', onKey);
  };
})();
