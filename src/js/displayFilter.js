export default class DisplayFilter {
    constructor(viewer) {
        this._viewer = viewer;
        this._filterSelection = "isolateChoice";
        this._gradientSelection = "offGradientChoice";
        this._sliderVals = new Map();
        this._priceColorMap = new Map();
        this._stockColorMap = new Map();
        this._defaultColors = new Map();
        this._filteredNodes = [];
        this._companyFilter = [];
        let selectedCompanies = document.getElementsByClassName("selected");
        for (let element of selectedCompanies) {
            let inputElement = element;
            this._companyFilter.push(inputElement.alt);
        }
        let sliderElements = document.querySelectorAll("#psMinSlider, #psMaxSlider, #ssMinSlider, #ssMaxSlider");
        sliderElements.forEach((x) => {
            let slider = x;
            switch (slider.id) {
                case "psMinSlider":
                    this._sliderVals.set("psMinVal", slider.value);
                    break;
                case "psMaxSlider":
                    this._sliderVals.set("psMaxVal", slider.value);
                    break;
                case "ssMinSlider":
                    this._sliderVals.set("ssMinVal", slider.value);
                    break;
                case "ssMaxSlider":
                    this._sliderVals.set("ssMaxVal", slider.value);
                    break;
                default:
                    console.log("Slider element value not found.");
            }
        });
    }
    updateSliderRange(id) {
        let sliderElement = document.getElementById(`${id}Slider`);
        let key = id + "Val";
        this._sliderVals.set(key, sliderElement.value);
    }
    updateSliderLabels(filter) {
        let id1 = filter.substring(0, 2) + "MinVal";
        let id2 = filter.substring(0, 2) + "MaxVal";
        let minVal = parseInt(this._sliderVals.get(id1));
        let maxVal = parseInt(this._sliderVals.get(id2));
        if (minVal >= maxVal) {
            minVal = maxVal - 1;
            this._sliders.get(id1).value = minVal.toString();
            this._sliderVals.set(id1, minVal.toString());
            return;
        }
        if (maxVal <= minVal) {
            maxVal = minVal + 1;
            this._sliders.get(id2).value = maxVal.toString();
            this._sliderVals.set(id2, maxVal.toString());
            return;
        }
        let valueLabels = document.querySelectorAll(`#${id1} , #${id2}`);
        valueLabels[0].innerHTML = minVal.toString();
        valueLabels[1].innerHTML = maxVal.toString();
    }
    gatherFilteredNodes(modelData) {
        let pMinVal = parseInt(this._sliderVals.get("psMinVal"));
        let pMaxVal = parseInt(this._sliderVals.get("psMaxVal"));
        let sMinVal = parseInt(this._sliderVals.get("ssMinVal"));
        let sMaxVal = parseInt(this._sliderVals.get("ssMaxVal"));
        let pNodesPassed = [];
        let sNodesPassed = [];
        let mNodesPassed = [];
        let valuesIterator = modelData.values();
        for (let nodeValues of valuesIterator) {
            if (nodeValues.Price >= pMinVal && nodeValues.Price <= pMaxVal) {
                pNodesPassed.push(nodeValues.ID);
            }
            if (nodeValues.Stock >= sMinVal && nodeValues.Stock <= sMaxVal) {
                sNodesPassed.push(nodeValues.ID);
            }
            if (this._companyFilter.indexOf(nodeValues.Manufacturer) !== -1) {
                mNodesPassed.push(nodeValues.ID);
            }
        }
        let psNodesPassed =  pNodesPassed.filter(value => -1 !== sNodesPassed.indexOf(value));
        this._filteredNodes = psNodesPassed.filter(value => -1 !== mNodesPassed.indexOf(value));
        this.updateColorGradients(modelData);
    }
    setRenderingSelection() {
        if (this._viewer.view.getDrawMode() === Communicator.DrawMode.XRay) {
            this._viewer.selectionManager.clear();
            this._viewer.view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
        }
        let promiseArray = [];
        promiseArray.push(this._viewer.model.unsetNodesFaceColor([this._viewer.model.getAbsoluteRootNode()]));
        promiseArray.push(this._viewer.model.setNodesVisibility([this._viewer.model.getAbsoluteRootNode()], true));
        promiseArray.push(this._viewer.model.setNodesOpacity([this._viewer.model.getAbsoluteRootNode()], 1.0));
        Promise.all(promiseArray)
            .then(() => {
            if (this._filterSelection === "isolateChoice") {
                this._viewer.model.setNodesVisibility([this._viewer.model.getAbsoluteRootNode()], false)
                    .then(() => this._viewer.model.setNodesVisibility(this._filteredNodes, true));
            }
            else if (this._filterSelection === "transparentChoice") {
                this._viewer.model.setNodesOpacity([this._viewer.model.getAbsoluteRootNode()], 0.25);
                this._viewer.model.setNodesOpacity(this._filteredNodes, 1.0);
            }
            else if (this._filterSelection === "xrayChoice") {
                this._viewer.view.setDrawMode(Communicator.DrawMode.XRay);
                let sm = this._viewer.selectionManager;
                sm.clear();
                this._filteredNodes.forEach(nodeId => {
                    sm.selectNode(nodeId, Communicator.SelectionMode.Add);
                });
            }
            if (this._gradientSelection === "priceGradientChoice") {
                this._viewer.model.setNodesColors(this._priceColorMap);
            }
            else if (this._gradientSelection === "stockGradientChoice") {
                this._viewer.model.setNodesColors(this._stockColorMap);
            }
        });          
    }
    captureNativeColors(modelData) {
        let valuesIterator = modelData.values();
        for (let nodeValues of valuesIterator) {
            this._viewer.model.getNodesEffectiveFaceColor([nodeValues.ID])
                .then(([color]) => {
                this._defaultColors.set(nodeValues.ID, color);
            });
        }
    }
    updateColorGradients(modelData) {
        let minPrice = 250, maxPrice = 0, minStock = 1000, maxStock = 0;
        this._filteredNodes.forEach((node) => {
            let nodeValues = modelData.get(node);
            if (nodeValues.Price < minPrice)
                minPrice = nodeValues.Price;
            if (nodeValues.Price > maxPrice)
                maxPrice = nodeValues.Price;
            if (nodeValues.Stock < minStock)
                minStock = nodeValues.Stock;
            if (nodeValues.Stock > maxStock)
                maxStock = nodeValues.Stock;
        });
        let valuesIterator = modelData.values();
        for (let nodeValues of valuesIterator) {
            if (this._filteredNodes.indexOf(nodeValues.ID) == -1) {
                this._priceColorMap.set(nodeValues.ID, this._defaultColors.get(nodeValues.ID));
                this._stockColorMap.set(nodeValues.ID, this._defaultColors.get(nodeValues.ID));
            }
            else {
                let pr = (nodeValues.Price - minPrice) / (maxPrice - minPrice) * 255;
                let pb = (1 - (nodeValues.Price - minPrice) / (maxPrice - minPrice)) * 255;
                let pg = (1 - Math.abs((nodeValues.Price - minPrice) / (maxPrice - minPrice) - (1 - ((nodeValues.Price - minPrice) / (maxPrice - minPrice))))) * 255;
                let sr = (1 - (nodeValues.Stock - minStock) / (maxStock - minStock)) * 255;
                let sb = (1 - (nodeValues.Stock) / (maxStock)) * 50;
                let sg = (nodeValues.Stock - minStock) / (maxStock - minStock) * 160;
                this._priceColorMap.set(nodeValues.ID, new Communicator.Color(pr, pg, pb));
                this._stockColorMap.set(nodeValues.ID, new Communicator.Color(sr, sg, 0));
            }
        }
    }
    addCompany(company) {
        this._companyFilter.push(company);
    }
    removeCompany(company) {
        let index = this._companyFilter.indexOf(company);
        this._companyFilter.splice(index, 1);
    }
    setFilterSelection(filter) {
        this._filterSelection = filter;
    }
    setGradientSelection(choice) {
        this._gradientSelection = choice;
    }
}
