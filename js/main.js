var restaurants,
  neighborhoods,
  cuisines
  var map
  var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const picture = document.createElement('picture');
  picture.className = 'restaurant-img';
  picture.setAttribute('role', 'img');
  picture.setAttribute('aria-label', 'restaurant '.concat(restaurant.name));

 
  const source800 = document.createElement('source');
  source800.setAttribute('media', '(max-width:744px)');
  source800.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant));
  picture.appendChild(source800);
  
  const source400 = document.createElement('source');
  source400.setAttribute('media', '(min-width:745px) and (max-width:1048px)');
  source400.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant).replace('.jpg','_400.jpg'));
  picture.appendChild(source400);

  const source300 = document.createElement('source');
  source300.setAttribute('media', '(min-width:1049px)');
  source300.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant).replace('.jpg','_300.jpg'));
  picture.appendChild(source300);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', 'restaurant '.concat(restaurant.name));
  picture.appendChild(image);
  li.append(picture);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('role', 'button');
  more.setAttribute('aria-label', 'View more details about restaurant '.concat(restaurant.name));
  li.append(more)

  return li
}



/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}


/**
 * Service worker
 */

(initializeServiceWorker = () => {
  return new Promise((resolve, reject) => {
    if (navigator.serviceWorker) {

      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (reg) {
          if (!navigator.serviceWorker.controller) {
            return;
          }
          if (reg.waiting) {
            console.log('Waiting');
            _updateReady(reg.waiting);
            return;
          }

          if (reg.installing) {
            console.log('Installing');
            _trackInstalling(reg.installing);

            return;
          }

          reg.addEventListener('updatefound', function () {
            console.log('Update found');
            _trackInstalling(reg.installing);

          });
          console.log('ServiceWorker successfuly registerd: ', reg.scope);
        });
      }, function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });

      // Ensure refresh is only called once.
      // This works around a bug in "force update on reload".
      var refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        console.log('controllerchange');
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    }
  });
})();

function _trackInstalling(worker) {
  worker.addEventListener('statechange', function () {
    if (worker.state == 'installed') {
      _updateReady(worker);
    }
  });
}

function _updateReady(worker) {
  let modalWindow = document.getElementById('openModal');
  let refreshBtn = document.getElementById('btnRefresh');
  let dialog = new Dialog(modalWindow);
  dialog.addEventListeners('.modalWindow', '.cancel');
  dialog.open();
 
  refreshBtn.addEventListener('click', function () {
    worker.postMessage({ action: 'skipWaiting' });
    refreshBtn.removeEventListener('click', worker.postMessage({ action: 'skipWaiting' }));
  });
}