

// Application logic will begin once DOM content is loaded
window.onload = () => {
  app = new main();
};


class main {

  constructor() {

    this.setEventListeners();
    
  } // End app Constructor

  setEventListeners() {

    document.getElementById("psMinSlider").oninput = () => {

    };
    document.getElementById("psMaxSlider").oninput = () => {

    };
    document.getElementById("ssMinSlider").oninput = () => {

    };
    document.getElementById("ssMaxSlider").oninput = () => {

    };
    document.getElementsByName("displaymode").forEach(element => {

    });
    document.getElementsByName("gradientmode").forEach(element => {

    });

  } // End setting event listeners

} // End app class
