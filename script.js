const apiKey = '113ae59e12354e28a9fece79902e1e74';

const categories = ['general', 'business', 'science', 'technology', 'health', 'sports', 'entertainment'];

const logo = document.querySelector('.logo');
const categorySelect = document.querySelector('.category-select');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const aboutLink = document.querySelector('.about-link');
const contactLink = document.querySelector('.contact-link');

const newsContainer = document.querySelector('.news-container');
const infoContainer = document.querySelector('.info-container');
const paginationContainer = document.querySelector('.pagination-container');
const pageNumber = document.getElementById('page-number');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.querySelector('.modal-title');
const modalImage = document.querySelector('.modal-image');
const modalDescription = document.querySelector('.modal-description');
const modalUrl = document.querySelector('.modal-url');

const scrollTopBtn = document.getElementById('scroll-top-btn');

let currentArticles = [];
let filteredArticles = [];
let currentCategory = 'general';
let currentPage = 1;
const articlesPerPage = 12;
let isSearchActive = false;

async function fetchAllCategories() {
  const allArticles = [];

  for (const cat of categories) {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${cat}&apiKey=${apiKey}&pageSize=20`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'ok' && data.articles) {
        data.articles.forEach(article => {
          article.category = cat;
          allArticles.push(article);
        });
      }
    } catch (error) {
      console.error(`Error fetching ${cat}:`, error);
    }
  }

  return allArticles;
}

async function fetchNews(category = 'general') {
  document.body.classList.remove('about-active', 'contact-active');
  infoContainer.style.display = 'none';
  newsContainer.style.display = 'grid';
  paginationContainer.style.display = 'flex';

  isSearchActive = false;
  currentCategory = category;
  currentPage = 1;

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}&pageSize=50`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') {
      newsContainer.innerHTML = `<p>Error: ${data.message}</p>`;
      paginationContainer.style.display = 'none';
      return;
    }

    currentArticles = data.articles.map(article => {
      article.category = category;
      return article;
    });

    filteredArticles = [...currentArticles];
    displayNews();
  } catch (error) {
    newsContainer.innerHTML = `<p>Network error: ${error.message}</p>`;
    paginationContainer.style.display = 'none';
  }
}

async function searchNews(query) {
  if (!query) return;

  document.body.classList.remove('about-active', 'contact-active');
  infoContainer.style.display = 'none';
  newsContainer.style.display = 'grid';
  paginationContainer.style.display = 'flex';

  isSearchActive = true;
  currentPage = 1;

  const allArticles = await fetchAllCategories();

  filteredArticles = allArticles.filter(article => {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    return title.includes(query.toLowerCase()) || description.includes(query.toLowerCase());
  });

  currentArticles = filteredArticles;
  displayNews();
}

function displayNews() {
  const validArticles = filteredArticles.filter(article =>
    article.title && article.urlToImage && article.description
  );

  const totalPages = Math.ceil(validArticles.length / articlesPerPage);
  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const paginatedArticles = validArticles.slice(start, end);

  newsContainer.innerHTML = '';

  if (paginatedArticles.length === 0) {
    newsContainer.innerHTML = '<p>No results found.</p>';
    paginationContainer.style.display = 'none';
    return;
  }

  paginatedArticles.forEach((article, index) => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.dataset.index = start + index;

    div.innerHTML = `
      <img src="${article.urlToImage}" class="news-img" alt="News Image" />
      <div class="news-content">
        <h3>${article.title}</h3>
        <p class="category-label"><strong>${article.category}</strong></p>
        <p>${article.description}</p>
        <p class="news-source">${article.source.name} - ${new Date(article.publishedAt).toLocaleString()}</p>
      </div>
    `;

    newsContainer.appendChild(div);
  });

  pageNumber.textContent = currentPage;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}


prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayNews();
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayNews();
  }
});

categorySelect.addEventListener('change', () => {
  fetchNews(categorySelect.value);
});

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    searchNews(query);
  }
});

newsContainer.addEventListener('click', e => {
  const item = e.target.closest('.news-item');
  if (!item) return;
  const idx = item.dataset.index;
  const article = filteredArticles[idx];
  modalTitle.textContent = article.title;
  modalImage.src = article.urlToImage || 'https://via.placeholder.com/600x300?text=No+Image';
  modalDescription.textContent = article.content || article.description || '';
  modalUrl.href = article.url;
  modal.style.display = 'flex';
});

modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

logo.addEventListener('click', () => {
  fetchNews('general');
});

aboutLink.addEventListener('click', e => {
  e.preventDefault();
  newsContainer.style.display = 'none';
  paginationContainer.style.display = 'none';
  infoContainer.style.display = 'block';
  infoContainer.innerHTML = `
  <div class="info-content about-info">
  <h2>About Us</h2>
  <p>
    Welcome to NewsSite – your reliable and up-to-date source of global and local news. Founded with the mission to deliver unbiased, accurate, and timely information, we bring you news that matters.
  </p>
  <p>
    Our editorial team is made up of experienced journalists, content creators, and researchers who are passionate about telling real stories and uncovering the truth. We cover a wide range of categories including politics, business, health, science, technology, sports, and entertainment.
  </p>
  <p>
    At NewsSite, we believe that access to credible news is a fundamental right. Our platform is built to empower readers with clarity, context, and diverse perspectives. Whether you're looking for breaking news, in-depth reports, or human-interest stories – we've got you covered.
  </p>
  <p>
    Join thousands of daily readers and stay informed with our balanced and independent reporting. Thank you for trusting NewsSite as your go-to news platform.
  </p>
</div>
  `;
  document.body.classList.add('about-active');
  document.body.classList.remove('contact-active');
});

contactLink.addEventListener('click', e => {
  e.preventDefault();
  newsContainer.style.display = 'none';
  paginationContainer.style.display = 'none';
  infoContainer.style.display = 'block';
  infoContainer.innerHTML = `
   <div class="info-content contact-info">
  <h2>Contact Us</h2>
  <p>
    We'd love to hear from you! Whether you have a question about our stories, feedback to improve, or a collaboration proposal – we’re here to listen.
  </p>
  <p><strong>Email (Support):</strong> support@newssite.com</p>
  <p><strong>Phone:</strong> +1 555 123 4567</p>
  <p><strong>Address:</strong> 123 Media Street, NewsCity, NY 10001, USA</p>

  <h3>General Inquiries:</h3>
  <p>
    For questions about our editorial policies, submitting a news tip, or general inquiries, email <strong>info@newssite.com</strong>.
  </p>

  <h3>Advertising & Partnerships:</h3>
  <p>
    Interested in advertising or forming a media partnership? Reach out to <strong>ads@newssite.com</strong>.
  </p>

  <h3>Follow us on social media:</h3>
  <ul>
    <li> <a href="https://www.facebook.com/" target="_blank" rel="noopener"><img src="./facebook.png"
              alt="Facebook" />
          </a></li>
    <li> <a href="https://x.com/" target="_blank" rel="noopener"><img src="./x.png" alt="X" /></a></li>
    <li><a href="https://www.instagram.com/" target="_blank" rel="noopener"><img src="./instagram.png"
              alt="Instagram" /></a></li>
  </ul>
</div>
  `;
  document.body.classList.add('contact-active');
  document.body.classList.remove('about-active');
});

window.addEventListener('scroll', () => {
  scrollTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('current-year').textContent = new Date().getFullYear();

fetchNews('general');
// quicklink
const privacyPolicyContent = `
 <div class="info-content privacy-policy">
    <h2>Privacy Policy</h2>
    <p>At NewsSite, we take your privacy seriously. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to protect your personal data.</p>
    <p><strong>Information We Collect:</strong> When you visit our site, we may collect non-personally identifiable information such as browser type, IP address, and pages visited. If you subscribe to newsletters or contact us, we may also collect your name and email address.</p>
    <p><strong>How We Use Your Information:</strong> We use collected data to improve our content, personalize your experience, and send you updates (if you opt-in). We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
    <p><strong>Security:</strong> We implement reasonable technical and organizational measures to safeguard your data from unauthorized access, disclosure, or misuse.</p>
    <p>By using NewsSite, you agree to the practices outlined in this Privacy Policy. We may update this policy from time to time, and the latest version will always be available here.</p>
  </div>
`;

const termsServiceContent = `
 <div class="info-content terms-service">
    <h2>Terms of Service</h2>
    <p>Welcome to NewsSite. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to comply with and be bound by these terms.</p>
    <p><strong>Content Usage:</strong> All content on NewsSite is for informational purposes only. You may not copy, reproduce, or redistribute content without explicit permission, except for personal and non-commercial use.</p>
    <p><strong>User Conduct:</strong> Users are expected to interact respectfully. You agree not to post harmful, misleading, or illegal content. We reserve the right to remove such content and suspend accounts at our discretion.</p>
    <p><strong>Limitation of Liability:</strong> NewsSite is not liable for any losses or damages resulting from reliance on content published on this site. While we strive for accuracy, we do not guarantee error-free information.</p>
    <p>We reserve the right to update these terms at any time. Continued use of the platform after changes implies acceptance of the updated terms.</p>
  </div>
`;


const aboutLinkFooter = document.querySelector('.about-link-footer');
const contactLinkFooter = document.querySelector('.contact-link-footer');
const privacyPolicyLink = document.querySelector('.privacy-policy-link');
const termsServiceLink = document.querySelector('.terms-service-link');

function showInfoContent(htmlContent) {
  newsContainer.style.display = 'none';
  paginationContainer.style.display = 'none';
  infoContainer.style.display = 'block';
  infoContainer.innerHTML = htmlContent;
  document.body.classList.remove('about-active', 'contact-active');
}

aboutLinkFooter.addEventListener('click', e => {
  e.preventDefault();
  showInfoContent(`
    <div class="info-content about-info">
      <h2>About Us</h2>
      <p>
        Welcome to NewsSite – your reliable and up-to-date source of global and local news. Founded with the mission to deliver unbiased, accurate, and timely information, we bring you news that matters.
      </p>
      <p>
        Our editorial team is made up of experienced journalists, content creators, and researchers who are passionate about telling real stories and uncovering the truth. We cover a wide range of categories including politics, business, health, science, technology, sports, and entertainment.
      </p>
      <p>
        At NewsSite, we believe that access to credible news is a fundamental right. Our platform is built to empower readers with clarity, context, and diverse perspectives. Whether you're looking for breaking news, in-depth reports, or human-interest stories – we've got you covered.
      </p>
      <p>
        Join thousands of daily readers and stay informed with our balanced and independent reporting. Thank you for trusting NewsSite as your go-to news platform.
      </p>
    </div>
  `);
});

contactLinkFooter.addEventListener('click', e => {
  e.preventDefault();
  showInfoContent(`
    <div class="info-content contact-info">
      <h2>Contact Us</h2>
      <p>
        We'd love to hear from you! Whether you have a question about our stories, feedback to improve, or a collaboration proposal – we’re here to listen.
      </p>
      <p><strong>Email (Support):</strong> support@newssite.com</p>
      <p><strong>Phone:</strong> +1 555 123 4567</p>
      <p><strong>Address:</strong> 123 Media Street, NewsCity, NY 10001, USA</p>

      <h3>General Inquiries:</h3>
      <p>
        For questions about our editorial policies, submitting a news tip, or general inquiries, email <strong>info@newssite.com</strong>.
      </p>

      <h3>Advertising & Partnerships:</h3>
      <p>
        Interested in advertising or forming a media partnership? Reach out to <strong>ads@newssite.com</strong>.
      </p>

      <h3>Follow us on social media:</h3>
      <ul>
        <li><a href="https://www.facebook.com/" target="_blank" rel="noopener"><img src="./facebook.png" alt="Facebook" /></a></li>
        <li><a href="https://x.com/" target="_blank" rel="noopener"><img src="./x.png" alt="X" /></a></li>
        <li><a href="https://www.instagram.com/" target="_blank" rel="noopener"><img src="./instagram.png" alt="Instagram" /></a></li>
      </ul>
    </div>
  `);
});

privacyPolicyLink.addEventListener('click', e => {
  e.preventDefault();
  showInfoContent(privacyPolicyContent);
});

termsServiceLink.addEventListener('click', e => {
  e.preventDefault();
  showInfoContent(termsServiceContent);
});
