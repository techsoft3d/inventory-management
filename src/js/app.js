

// Application logic will begin once DOM content is loaded
window.onload = () => {
  const app = new main();
};


class main {
  constructor() {

    // Initialize a Map to quickly reference nodeId -> external app data
    // The Map will be populated when a model is loaded
    this._modelData = new Map();

    // Instantiate the viewer
    this._viewer = new Communicator.WebViewer({
      containerId: "viewer",
      empty: true
    });
    this._viewer.start();

    this._displayFilter = new DisplayFilter(this._viewer);

    // Set the viewer callback functionality
    this.setViewerCallbacks(); // End Callbacks

    this.setEventListeners();

  } // End app constructor

  setViewerCallbacks() {
    this._viewer.setCallbacks({

      selectionArray: (selectionEvents) => {
        // Reset info fields if no selection item was chosen
        if (selectionEvents.length == 0) {
          document.getElementById("node-id").innerHTML = "--";
          document.getElementById("node-name").innerHTML = "--";
          document.getElementById("inv-manufacturer").innerHTML = "--";
          document.getElementById("inv-select-cost").innerHTML = "--";
          document.getElementById("inv-total-stock").innerHTML = "--";
          document.getElementById("inv-avail-stock").innerHTML = "--";
          document.getElementById("inv-claimed").innerHTML = "--";
          document.getElementById("inv-location").innerHTML = "--";
          return;
        }

        // Otherwise, display node information for the first node in the selection array
        const nodeId = selectionEvents[0].getSelection().getNodeId();
        document.getElementById("node-id").innerHTML = nodeId.toString() || "Unknown";
        document.getElementById("node-name").innerHTML = this._viewer.model.getNodeName(nodeId) || "Node Name Not Defined";

        // If the selection nodeId is found in the application data, populate the inspector fields
        if (this._modelData.has(nodeId)) {
          let nodeData = this._modelData.get(nodeId);
          document.getElementById("inv-manufacturer").innerHTML = nodeData.Manufacturer;
          document.getElementById("inv-select-cost").innerHTML = `$ ${nodeData.Price.toFixed(2)}`;
          document.getElementById("inv-total-stock").innerHTML = nodeData.Stock.toString();
          document.getElementById("inv-avail-stock").innerHTML = (nodeData.Stock - nodeData.Reserved).toString();
          document.getElementById("inv-claimed").innerHTML = nodeData.Reserved.toString();
          document.getElementById("inv-location").innerHTML = nodeData.Location;
        }
      },

      sceneReady: () => {

        // Set Background color for viewers
        this._viewer.view.setBackgroundColor(new Communicator.Color(0, 153, 220), new Communicator.Color(218, 220, 222));

        // Enable nav cube and axis triad
        this._viewer.view.getAxisTriad().enable();
        this._viewer.view.getNavCube().enable();
        this._viewer.view.getNavCube().setAnchor(Communicator.OverlayAnchor.LowerRightCorner);

      }
    });
  }

  loadModel(modelName) {
    this._viewer.model.clear()
      .then(() => {
        const nodeName = "Model-" + modelName;
        const modelNodeId = this._viewer.model.createNode(null, nodeName);
        this._viewer.model.loadSubtreeFromScsFile(modelNodeId, "./data/" + modelName + ".scs")
          .then(() => {
            this._viewer.view.fitWorld();
            fetch("./data/database/" + modelName + ".json")
              .then((resp) => {
                if (resp.ok) {
                  resp.json()
                    .then((data) => {

                      let nodeData = data.NodeData;
                      let numEntries = nodeData.length;
                      let clippedID;
                      let totalCost = 0;
                      this._modelData.clear();
                      for (let i = 0; i < numEntries; ++i) {
                        clippedID = nodeData[i].ID;
                        this._modelData.set(clippedID, nodeData[i]);
                        totalCost += nodeData[i].Price;
                      }
                      // Display the total cost of the assembly
                      document.getElementById("inv-total-cost").innerHTML = `$ ${totalCost.toFixed(2)}`;
                      this._displayFilter.captureNativeColors(this._modelData);
                      this._displayFilter.gatherFilteredNodes(this._modelData);
                      this._displayFilter.updateColorGradients(this._modelData);
                      this._displayFilter.setRenderingSelection();
                    });

                }
                else {
                  alert("No JSON data for this Model was found.");
                }
              });
            // Get and set the rest of the model level info
            const modelRoot = this._viewer.model.getNodeChildren(modelNodeId)[0];
            const modelFileName = this._viewer.model.getModelFileNameFromNode(modelRoot);
            const modelFileFormat = this._viewer.model.getModelFileTypeFromNode(modelRoot);
            document.getElementById("model-file-name").innerHTML = modelFileName || "N/A";
            document.getElementById("model-file-type").innerHTML = Communicator.FileType[modelFileFormat] || "N/A";
          });
      });
  }

  sliderOnInput(slider) {
    this._displayFilter.updateSliderRange(slider);
    this._displayFilter.updateSliderLabels(slider);
    this._displayFilter.gatherFilteredNodes(this._modelData);
    this._displayFilter.setRenderingSelection();
  }

  setEventListeners() {

    document.getElementById("psMinSlider").oninput = () => {
      this.sliderOnInput("psMin");
    };
    document.getElementById("psMaxSlider").oninput = () => {
      this.sliderOnInput("psMax");
    };
    document.getElementById("ssMinSlider").oninput = () => {
      this.sliderOnInput("ssMin");
    };
    document.getElementById("ssMaxSlider").oninput = () => {
      this.sliderOnInput("ssMax");
    };
    document.getElementsByName("displaymode").forEach((element) => {
      let inputElement = element;
      inputElement.onclick = () => {
        this._displayFilter.setFilterSelection(inputElement.id);
        this._displayFilter.gatherFilteredNodes(this._modelData);
        this._displayFilter.setRenderingSelection();
      };
    });
    document.getElementsByName("gradientmode").forEach((element) => {
      let inputElement = element;
      inputElement.onclick = () => {
        this._displayFilter.setGradientSelection(inputElement.id);
        this._displayFilter.setRenderingSelection();
      };
    });

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


    let compButtons = document.getElementById("companyFilter").getElementsByClassName("companyFilterButton");
    for (let element of compButtons) {
      let htmlelement = element;
      htmlelement.onclick = () => {
        if (htmlelement.classList.contains("selected")) {
          htmlelement.classList.remove("selected");
          this._displayFilter.removeCompany(htmlelement.alt);
        }
        else {
          htmlelement.classList.add("selected");
          this._displayFilter.addCompany(htmlelement.alt);
        }
        this._displayFilter.gatherFilteredNodes(this._modelData);
        this._displayFilter.setRenderingSelection();
      }
    }

  } // End setting event listeners

} // End app class
