const courses = Array.isArray(window.courses) ? window.courses : [];
const FILTER_ALL = 'all';
const categoryOrder = Array.from(new Set(courses.map(({ sphere }) => sphere)));
const categories = [FILTER_ALL, ...categoryOrder];

const getBadgeColor = (sphere) => {
  const colors = {
    'Marketing': '#03CEA4',
    'Management': '#5A87FC',
    'HR & Recruiting': '#F89828',
    'Design': '#F52F6E',
    'Development': '#7772F1'
  };
  
  return colors[sphere] || '#ffffff';
};

const state = {
  category: FILTER_ALL,
  query: ''
};

const elements = {
  filterList: null,
  searchInput: null,
  groupsContainer: null,
  emptyState: null
};

const sortedCourses = [...courses].sort((first, second) => {
  const categoryDiff = categoryOrder.indexOf(first.sphere) - categoryOrder.indexOf(second.sphere);

  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  return first.name.localeCompare(second.name);
});

const init = () => {
  cacheElements();

  if (!areElementsReady()) {
    console.error('Не найдены элементы интерфейса каталога.');
    return;
  }

  renderFilters();
  renderGroups();
  bindEvents();
};

const cacheElements = () => {
  elements.filterList = document.querySelector('[data-filter-list]');
  elements.searchInput = document.querySelector('[data-search-input]');
  elements.groupsContainer = document.querySelector('[data-groups]');
  elements.emptyState = document.querySelector('[data-empty]');
};

const areElementsReady = () => {
  return Object.values(elements).every(Boolean);
};

const bindEvents = () => {
  elements.filterList.addEventListener('click', handleCategoryClick);
  elements.searchInput.addEventListener('input', handleSearchInput);
};

const handleCategoryClick = (event) => {
  const button = event.target.closest('[data-category]');

  if (!button) {
    return;
  }

  const { category } = button.dataset;

  if (!category || category === state.category) {
    return;
  }

  state.category = category;
  renderFilters();
  renderGroups();
};

const handleSearchInput = (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderFilters();
  renderGroups();
};

const getCourseCount = (category) => {
  return sortedCourses.filter((course) => {
    const matchesCategory = category === FILTER_ALL || course.sphere === category;

    if (!matchesCategory) {
      return false;
    }

    if (!state.query) {
      return true;
    }

    const haystack = `${course.name} ${course.author} ${course.sphere}`.toLowerCase();
    return haystack.includes(state.query);
  }).length;
};

const renderFilters = () => {
  elements.filterList.innerHTML = '';

  categories.forEach((category) => {
    const button = document.createElement('button');
    const isActive = category === state.category;
    const count = getCourseCount(category);

    button.type = 'button';
    button.className = 'catalog-filter__tag';
    button.dataset.category = category;
    button.classList.toggle('catalog-filter__tag--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));

    const text = document.createElement('span');
    text.className = 'catalog-filter__tag-text';
    text.textContent = category === FILTER_ALL ? 'All' : category;

    const counter = document.createElement('span');
    counter.className = 'catalog-filter__tag-count';
    counter.textContent = count;

    button.append(text, counter);
    elements.filterList.appendChild(button);
  });
};

const renderGroups = () => {
  const visibleCourses = getVisibleCourses();

  elements.groupsContainer.innerHTML = '';

  if (!visibleCourses.length) {
    elements.emptyState.hidden = false;
    return;
  }

  elements.emptyState.hidden = true;

  const list = createCourseList(visibleCourses);
  elements.groupsContainer.appendChild(list);
};

const getVisibleCourses = () => {
  return sortedCourses.filter((course) => {
    const matchesCategory = state.category === FILTER_ALL || course.sphere === state.category;

    if (!matchesCategory) {
      return false;
    }

    if (!state.query) {
      return true;
    }

    const haystack = `${course.name} ${course.author} ${course.sphere}`.toLowerCase();
    return haystack.includes(state.query);
  });
};

const createCourseList = (items) => {
  const list = createNode('ul', 'catalog__list');

  items.forEach((course) => {
    list.appendChild(createCourseCard(course));
  });

  return list;
};

const createCourseCard = (course) => {
  const item = createNode('li', 'course-card');
  item.append(createCourseCover(course), createCourseBody(course));
  return item;
};

const createCourseCover = (course) => {
  const cover = createNode('div', 'course-card__cover');
  const image = document.createElement('img');
  const badge = createNode('span', 'course-card__badge', course.sphere);

  image.className = 'course-card__image';
  image.src = course.img;
  image.alt = course.name;
  image.loading = 'lazy';

  badge.style.backgroundColor = getBadgeColor(course.sphere);

  cover.append(image, badge);
  return cover;
};

const createCourseBody = (course) => {
  const body = createNode('div', 'course-card__body');
  const title = createNode('h3', 'course-card__title', course.name);
  const author = createNode('p', 'course-card__author', course.author);

  body.append(title, author, createCourseFooter(course.price));
  return body;
};

const createCourseFooter = (priceValue) => {
  const footer = createNode('div', 'course-card__footer');
  const price = createNode('span', 'course-card__price', priceValue);
  const action = createNode('button', 'course-card__action', 'Подробнее');

  action.type = 'button';
  footer.append(price, action);

  return footer;
};

const createNode = (tag, className, textContent = '') => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

const bootstrap = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
    return;
  }

  init();
};

bootstrap();
