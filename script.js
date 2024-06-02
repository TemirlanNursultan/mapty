'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const sidebar = document.querySelectorAll('.sidebar');

class Workout {
  date = new Date();
  id = (new Date() + '').slice(15);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this._setDescription();
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this._calcPace();
  }
  _calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this._calcSpeed();
  }
  _calcSpeed() {
    //km/hr
    this.speed = this.distance / (this.duration / 60);
  }
}

class App {
  #map;
  #mapZoomLevel = 15;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    this._getFromLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      //Getting position object (GeoLocationPosition) and passing it to loadMap method:
      navigator.geolocation.getCurrentPosition(
        //We need to manually bind this keyword inside loadmap method as it is being called by GetCurrentPosition as a regular function call, not as method
        this._loadMap.bind(this),
        function () {
          alert(`not able to get your position`);
        }
      );
  }
  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    //Getting coordinates of position to later creat a map object around that position
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 15);
    console.log(this.#map);

    //Adding tile layers from the source to the map object:
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    //Adding EventHandler to the Map Object to showform on click on map:
    this.#map.on('click', this._showForm.bind(this), function () {
      alert(`not able to get your position`);
    });

    this.workouts.forEach(workout1 => {
      this._createPopup(workout1);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    form.classList.add('hidden');
    inputType.value = 'running';
  }
  _checkInputType(inpType, distance, duration, cadence, elevGain) {
    if (inpType === 'running') {
      const { lat, lng } = this.#mapEvent.latlng;
      const workout1 = new Running([lat, lng], distance, duration, cadence);
      return workout1;
    } else {
      const { lat, lng } = this.#mapEvent.latlng;
      const workout1 = new Cycling([lat, lng], distance, duration, elevGain);
      return workout1;
    }
  }
  _renderRunningFormOnList(id, description, Distance, Duration, pace, cadence) {
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `<li class="workout workout--running" data-id="${id}">
      <h2 class="workout__title">Running ${description}</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${Distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${Duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`
    );
  }
  _renderCyclingFormOnList(
    id,
    description,
    Distancevalue,
    Durationvalue,
    speed,
    Elevationvalue
  ) {
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `<        <li class="workout workout--cycling" data-id="${id}">
      <h2 class="workout__title">Cycling ${description}</h2>
      <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${Distancevalue}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${Durationvalue}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${Elevationvalue}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`
    );
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _createPopup(workout1) {
    const date = new Date(workout1.date);
    let month = months[date.getMonth()];
    var workoutDate = month + ' ' + date.getFullYear();

    L.marker(workout1.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          classname: `${workout1.type}-popup`,
        })
      )
      .setPopupContent(
        `${
          workout1.type === 'running' ? '🏃‍♂️ Running' : '🚴‍♀️ Cycling'
        } on ${workoutDate}`
      )
      .openPopup();
  }
  _newWorkout(e) {
    e.preventDefault();
    //1. Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevGain = +inputElevation.value;
    //2. Input data checked for validity
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    // If workout running:

    if (type === 'running') {
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');
    }

    // If workout cycling:
    if (type === 'cycling') {
      if (
        !validInputs(distance, duration, elevGain) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
    }

    const workout1 = this._checkInputType(
      type,
      distance,
      duration,
      cadence,
      elevGain
    );
    this.workouts.push(workout1);
    const date = workout1.date;
    let month = months[date.getMonth()];
    var workoutDate = month + ' ' + date.getFullYear();

    //5. Render workout form on map as marker
    this._createPopup(workout1);

    //6. Render workout on list
    if (inputType.value === 'running')
      this._renderRunningFormOnList(
        workout1.id,
        workout1.description,
        workout1.distance,
        workout1.duration,
        workout1.pace,
        workout1.cadence
      );
    if (inputType.value === 'cycling')
      this._renderCyclingFormOnList(
        workout1.id,
        workout1.description,
        workout1.distance,
        workout1.duration,
        workout1.speed,
        workout1.elevationGain
      );

    //7. Hide form + clear input fields
    this._hideForm();
    //Clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';

    //Display marker

    this._localStorage();
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    const id = workoutEl.dataset.id;

    const foundworkout = this.workouts.filter(function (i) {
      return i.id === id;
    });
    this.#map.setView(foundworkout[0].coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _localStorage() {
    localStorage.setItem('workout', JSON.stringify(this.workouts));
  }
  _getFromLocalStorage() {
    // Check if 'workout' exists in LocalStorage
    const workoutString = localStorage.getItem('workout');
    if (!workoutString) {
      console.log('No workout data found in LocalStorage.');
      return;
    }

    // Parse the 'workout' string
    const workout = JSON.parse(workoutString);
    this.workouts = workout;
    this.workouts.forEach(workout1 => {
      if (workout1.hasOwnProperty('cadence'))
        this._renderRunningFormOnList(
          workout1.id,
          workout1.description,
          workout1.distance,
          workout1.duration,
          workout1.pace,
          workout1.cadence
        );
      if (workout1.hasOwnProperty('elevationGain'))
        this._renderCyclingFormOnList(
          workout1.id,
          workout1.description,
          workout1.distance,
          workout1.duration,
          workout1.speed,
          workout1.elevationGain
        );
    });
  }
}

const app1 = new App();
