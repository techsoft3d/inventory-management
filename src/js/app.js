

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

  loadModel(modelName) {
    this._viewer.model.clear()
      .then(() => {
        const nodeName = "Model-" + modelName;
        const modelNodeId = this._viewer.model.createNode(null, nodeName);
        this._viewer.model.loadSubtreeFromScsFile(modelNodeId, "/data/" + modelName + ".scs")
          .then(() => {
            this._viewer.view.fitWorld();
            // Get and set the rest of the model level info
            const modelRoot = this._viewer.model.getNodeChildren(modelNodeId)[0];
            const modelFileName = this._viewer.model.getModelFileNameFromNode(modelRoot);
            const modelFileFormat = this._viewer.model.getModelFileTypeFromNode(modelRoot);
            document.getElementById("model-file-name").innerHTML = modelFileName || "N/A";
            document.getElementById("model-file-type").innerHTML = Communicator.FileType[modelFileFormat] || "N/A";
          });
      });
  }

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
      // Proxy to override the default behavior of file input type
      document.getElementById('file-input').click();
    };
    
    document.getElementById("file-input").onchange = (e) => {
      // Once a file has been selected by the user, use the file information to 
      // gather the associated relevant data like thumbnails
      let fileChoice = e.target.value;
      let filename = fileChoice.replace(/^.*[\\\/]/, '');
      let modelThumbnail = document.createElement('a');
      let modelname = filename.split(".", 1)[0];
      modelThumbnail.id = modelname;
      modelThumbnail.href = "";
      modelThumbnail.className = "model-thumb";
      modelThumbnail.setAttribute("model", modelname);
      let imgPath = "/data/thumbnails/" + modelname + ".png";
      // Check to see if the selected model has a corresponding thumbnail made
      fetch(imgPath)
        .then((resp) => {
          if (resp.ok) {
            let modelImg = document.createElement('img');
            modelImg.src = imgPath;
            modelThumbnail.appendChild(modelImg);
          }
          else {
            modelThumbnail.innerHTML = modelname;
            console.log("No Image for this Model was found.");
          }
        });
      document.getElementById("models-scroller").appendChild(modelThumbnail);
      // Now update the event callbacks for the thumbnails
      const thumbnailElements = document.getElementsByClassName("model-thumb");
      for (let thumbnail of thumbnailElements) {
        let thumbnailElement = thumbnail;
        thumbnailElement.onclick = (e) => {
          e.preventDefault();
          let elem = e.currentTarget;
          let modelToLoad = elem.getAttribute("model");
          // Load the model into the scene when clicked
          this.loadModel(modelToLoad);
        };
      };
    };

  } // End setting event listeners

} // End app class
