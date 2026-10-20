const categoryButtons = [...document.querySelectorAll('.filter-button')];
const menuItems = [...document.querySelectorAll('.catalog-item')];
const cookiesGrid = document.querySelector('.cookie-grid');
const priceFrom = document.querySelector('#price-from');
const priceTo = document.querySelector('#price-to');
const rangeFrom = document.querySelector('#range-from');
const rangeTo = document.querySelector('#range-to');
const rangeTrack = document.querySelector('#price-range');
const rangeFromLabel = document.querySelector('#range-from-label');
const rangeToLabel = document.querySelector('#range-to-label');
const searchInput = document.querySelector('#menu-search');
const sortSelect = document.querySelector('#menu-sort');
const clearButton = document.querySelector('#clear-filters');
const resultsLabel = document.querySelector('#menu-results');

const minimumPrice = Number(rangeFrom.min);
const maximumPrice = Number(rangeFrom.max);
const originalPosition = new Map(menuItems.map((item, index) => [item, index]));
const clampPrice = value => Math.min(maximumPrice, Math.max(minimumPrice, Number(value)));
const currency = value => `RM${value}`;

function syncRangeLabels(low, high) {
  const span = maximumPrice - minimumPrice || 1;
  rangeTrack.style.setProperty('--range-start', `${((low - minimumPrice) / span) * 100}%`);
  rangeTrack.style.setProperty('--range-end', `${((high - minimumPrice) / span) * 100}%`);
  rangeFromLabel.textContent = currency(low);
  rangeToLabel.textContent = currency(high);
}

function updateFromFields(changedField) {
  let low = priceFrom.value === '' ? minimumPrice : clampPrice(priceFrom.value);
  let high = priceTo.value === '' ? maximumPrice : clampPrice(priceTo.value);

  if (low > high) {
    if (changedField === priceFrom) {
      high = low;
      priceTo.value = high;
    } else {
      low = high;
      priceFrom.value = low;
    }
  }

  rangeFrom.value = low;
  rangeTo.value = high;
  syncRangeLabels(low, high);
  applyMenuFilters();
}

function updateFromSliders(changedSlider) {
  let low = Number(rangeFrom.value);
  let high = Number(rangeTo.value);

  if (low > high) {
    if (changedSlider === rangeFrom) {
      low = high;
      rangeFrom.value = low;
    } else {
      high = low;
      rangeTo.value = high;
    }
  }

  priceFrom.value = low === minimumPrice ? '' : low;
  priceTo.value = high === maximumPrice ? '' : high;
  syncRangeLabels(low, high);
  applyMenuFilters();
}

function sortMenuItems() {
  const sortMode = sortSelect.value;
  const grids = new Set(menuItems.map(item => item.parentElement));

  grids.forEach(grid => {
    const items = menuItems.filter(item => item.parentElement === grid);
    items.sort((a, b) => {
      if (sortMode === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
      if (sortMode === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      if (sortMode === 'name-asc') return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
      return originalPosition.get(a) - originalPosition.get(b);
    });
    items.forEach(item => grid.append(item));
  });
}

function applyMenuFilters() {
  const activeCategory = document.querySelector('.filter-button.active')?.dataset.filter || 'all';
  const minimum = priceFrom.value === '' ? minimumPrice : clampPrice(priceFrom.value);
  const maximum = priceTo.value === '' ? maximumPrice : clampPrice(priceTo.value);
  const phrase = searchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  menuItems.forEach(item => {
    const isCookie = item.parentElement === cookiesGrid;
    const matchesCategory = !isCookie || activeCategory === 'all' || item.dataset.kind === activeCategory;
    const matchesPrice = Number(item.dataset.price) >= minimum && Number(item.dataset.price) <= maximum;
    const matchesPhrase = !phrase || item.textContent.toLocaleLowerCase().includes(phrase);
    const isVisible = matchesCategory && matchesPrice && matchesPhrase;
    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultsLabel.textContent = visibleCount === 0
    ? 'No treats match these filters'
    : visibleCount === menuItems.length && !phrase && minimum === minimumPrice && maximum === maximumPrice && activeCategory === 'all'
      ? `Showing all ${menuItems.length} treats`
      : `Showing ${visibleCount} of ${menuItems.length} treats`;
}

categoryButtons.forEach(button => button.addEventListener('click', () => {
  categoryButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  applyMenuFilters();
}));

priceFrom.addEventListener('input', () => updateFromFields(priceFrom));
priceTo.addEventListener('input', () => updateFromFields(priceTo));
rangeFrom.addEventListener('input', () => updateFromSliders(rangeFrom));
rangeTo.addEventListener('input', () => updateFromSliders(rangeTo));
searchInput.addEventListener('input', applyMenuFilters);
sortSelect.addEventListener('change', () => {
  sortMenuItems();
  applyMenuFilters();
});

clearButton.addEventListener('click', () => {
  priceFrom.value = '';
  priceTo.value = '';
  rangeFrom.value = minimumPrice;
  rangeTo.value = maximumPrice;
  searchInput.value = '';
  sortSelect.value = 'featured';
  categoryButtons[0]?.click();
  sortMenuItems();
  syncRangeLabels(minimumPrice, maximumPrice);
  applyMenuFilters();
});

syncRangeLabels(minimumPrice, maximumPrice);
sortMenuItems();
applyMenuFilters();
