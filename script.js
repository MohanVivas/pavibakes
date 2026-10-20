const filters = document.querySelectorAll('.filter-button');
const products = document.querySelectorAll('.cookie-grid .product-card');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  products.forEach(product => {
    product.hidden = filter !== 'all' && product.dataset.kind !== filter;
  });
}));
