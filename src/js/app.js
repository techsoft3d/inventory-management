

// Application logic will begin once DOM content is loaded
window.onload = () => {
  app = new main();
};


class main {
  constructor() {
    // Instantiate the viewer
    this._viewer = new Communicator.WebViewer({
      containerId: "viewer",
      empty: true
    });
    this._viewer.start();

    // Set the viewer callback functionality
    this._viewer.setCallbacks({

      modelStructureReady: () => {

          // Enable load model button
          let loadButton = document.getElementById("open-model-button");
          loadButton.disabled = false;

      },

      selectionArray: (selectionEvents) => {
          // Reset info fields if no selection item was chosen
          // Otherwise, display node information for the first node in the selection array
          // If the selection nodeId is found in the application data, populate the inspector fields with application data
      }, 

      sceneReady: () => {

          // Set Background color for viewers
          this._viewer.view.setBackgroundColor(new Communicator.Color(0, 153, 220), new Communicator.Color(218, 220, 222));

          // Enable nav cube and axis triad
          this._viewer.view.getAxisTriad().enable();
          this._viewer.view.getNavCube().enable();
          this._viewer.view.getNavCube().setAnchor(Communicator.OverlayAnchor.LowerRightCorner);

      }
    }); // End Callbacks

    this.setEventListeners();
  } // End app constructor

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
    document.getElementById("open-model-button").onclick = () => {

    };
    document.getElementById("file-input").onchange = e => {

    };

  } // End setting event listeners

} // End app class
