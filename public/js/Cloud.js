 document.querySelector('.header-form-input').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const cards = document.querySelectorAll('.section-card-item');

    cards.forEach(card => {
      const titleElement = card.querySelector('h2');
      if (titleElement) {
        const title = titleElement.textContent.toLowerCase();
        const isMatch = title.startsWith(searchQuery);
        card.style.display = isMatch ? 'flex' : 'none';
      }
    });
  });
