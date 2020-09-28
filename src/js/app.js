import '../css/tutorial-userData.css';
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
        this._viewer.setCallbacks({
            modelStructureReady: () => {
                // Background color for viewers
                this._viewer.view.setBackgroundColor(new Communicator.Color(100, 150, 200), new Communicator.Color(222, 222, 222));
                
                // Additional viewer options
                this._viewer.view.getAxisTriad().enable();
                this._viewer.view.getNavCube().enable();
                this._viewer.view.getNavCube().setAnchor(Communicator.OverlayAnchor.LowerRightCorner);
                let loadButton = document.getElementById("open-model-button");
                loadButton.disabled = false;
            },
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
            }
        }); // End Callbacks
        this.setEventListeners();
    } // End main constructor
    loadModel(modelName) {
        this._viewer.model.clear()
            .then(() => {
            const nodeName = "Model-" + modelName;
            const modelNodeId = this._viewer.model.createNode(null, nodeName);
            this._viewer.model.loadSubtreeFromScsFile(modelNodeId, "/data/" + modelName + ".scs")
            .then(() => {
                this._viewer.view.fitWorld();
                fetch("/data/database/" + modelName + ".json")
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
    setEventListeners() {
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
    } // End setting even handlers
} // End main class









