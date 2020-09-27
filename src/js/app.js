import '../css/tutorial-userData.css';
// Application logic will begin once DOM content is loaded
window.onload = () => {
    const app = new main();
};
class main {
    constructor() {
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
                // Otherwise, display node information for the first node in the selection array
                // If the selection nodeId is found in the application data, populate the inspector fields with application data
            }
        }); // End Callbacks
    } // End main constructor
} // End main class







