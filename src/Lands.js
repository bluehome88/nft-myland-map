import { useContext, useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import {
  Tile as TileLayer,
  Vector as VectorLayer,
  Image as ImageLayer,
  VectorTile as VectorTileLayer,
} from "ol/layer";
import {
  VectorTile as VectorTileSource,
  Vector as VectorSource,
  ImageStatic as ImageStaticSource,
  OSM as OSMSource,
} from "ol/source";
import Draw, { createBox } from "ol/interaction/Draw";
import Overlay from "ol/Overlay";
import MVT from "ol/format/MVT";
import { Control, defaults as defaultControls } from "ol/control";
import Web3Context from "./store/web3Context";
import "ol/ol.css";
import "./lands.css";
import Config from "./config";

const geo = [
  {
    coordinates: [300000, 4343403],
    ref: "APD0004328",
    cpost: "02440",
    region: "Picardie",
    dep: "2",
    commune: "Remigny",
    text: "Camouflage avec les moyens de fortune",
    author: "Opérateur D ; Brissy, Edouard",
    date: "1917/06/16",
    copy: "Ministère de la Culture (France) - Médiathèque de l'Architecture et du Patrimoine - Diffusion RMN",
    img: "http://www.culture.gouv.fr/Wave/image/memoire/1599/sap40_d0004328_v.jpg",
  },
  {
    coordinates: [325003.397359, 50000.328235],
    ref: "APD0005719",
    cpost: "59220",
    region: "Nord-Pas-de-Calais",
    dep: "59",
    commune: "Denain",
    text: "Visite de la délégation de la Conférence de la paix à l'entrée",
    author: "Opérateur D ; Sélince",
    date: "1919/04/06",
    copy: "Ministère de la Culture (France) - Médiathèque de l'Architecture et du Patrimoine - Diffusion RMN",
    img: "http://www.culture.gouv.fr/Wave/image/memoire/1600/sap40_d0005719_v.jpg",
  },
];
function Lands() {
  const { buyLands, account } = useContext(Web3Context);
  var mouseCoord = useRef();

  const mapElement = useRef();
  const buyOverlayElement = useRef();
  const infoOverlayElement = useRef();

  const accountRef = useRef();
  accountRef.current = account;

  const buyLandsRef = useRef();
  buyLandsRef.current = buyLands;

  const doMint = (x1, y1, x2, y2) => {
    if (
      parseFloat(accountRef.current.balance) >=
      Math.abs(x1 - x2) * Math.abs(y1 - y2) * Config.pixelPrice
    ) {
      buyLandsRef.current(x1, y1, x2, y2, (res) => {
        if (res === -1) alert("Failed");
        else alert("Success");
      });
    } else {
      alert("Insufficient Funds");
    }
  };

  useEffect(() => {
    if (!window.doMint) window.doMint = doMint;

    class PencilOrHandControl extends Control {
      constructor(opt_options) {
        const options = opt_options || {};

        const button = document.createElement("button");
        button.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g fill="white"><path d="M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75z"/></g></svg>';

        const element = document.createElement("div");
        element.className = "rotate-north ol-unselectable ol-control";
        element.appendChild(button);

        super({
          element: element,
          target: options.target,
        });
        button.addEventListener(
          "click",
          this.handleRotateNorth.bind(this),
          false
        );
        this.status = "hand";
      }

      handleRotateNorth() {
        const draw = this.getMap()
          .getInteractions()
          .item(this.getMap().getInteractions().getLength() - 1);
        if (this.status === "hand") {
          this.status = "pencil";
          draw.setActive(true);
          this.element.children[0].innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g fill="white"><path d="M480 128v208c0 97.05-78.95 176-176 176h-37.72c-53.42 0-103.7-20.8-141.4-58.58l-113.1-113.1C3.906 332.5 0 322.2 0 312C0 290.7 17.15 272 40 272c10.23 0 20.47 3.906 28.28 11.72L128 343.4V64c0-17.67 14.33-32 32-32s32 14.33 32 32l.0729 176C192.1 248.8 199.2 256 208 256s16.07-7.164 16.07-16L224 32c0-17.67 14.33-32 32-32s32 14.33 32 32l.0484 208c0 8.836 7.111 16 15.95 16S320 248.8 320 240L320 64c0-17.67 14.33-32 32-32s32 14.33 32 32l.0729 176c0 8.836 7.091 16 15.93 16S416 248.8 416 240V128c0-17.67 14.33-32 32-32S480 110.3 480 128z"/></g></svg>';
        } else {
          this.status = "hand";
          draw.setActive(false);
          this.element.children[0].innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g fill="white"><path d="M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75z"/></g></svg>';
        }
      }
    }

    /**
     * Initialization of variables
     */

    const landSource = new VectorTileSource({
      format: new MVT(),
      url: "https://api.maptiler.com/tiles/land/{z}/{x}/{y}.pbf?key=oNZwiLnC8cX8YW6850yV",
    });
    const landLayer = new VectorTileLayer({
      source: landSource,
    });

    const drawSource = new VectorSource({ wrapX: false });
    const drawLayer = new VectorLayer({ source: drawSource });

    const buyOverlay = new Overlay({
      element: buyOverlayElement.current,
      positioning: "top-left",
      offset: [2, 0],
    });
    const infoOverlay = new Overlay({
      element: infoOverlayElement.current,
      positioning: "top-left",
      offset: [2, 0],
    });

    var layers = [
      new TileLayer({
        source: new OSMSource(),
      }),
      landLayer,
      drawLayer,
    ];

    geo.forEach((each) => {
      const src = new ImageStaticSource({
        url: each["img"],
        imageExtent: [
          each["coordinates"][0],
          each["coordinates"][1],
          each["coordinates"][0] + 1000000,
          each["coordinates"][1] + 1000000,
        ],
      });

      const lay = new ImageLayer({
        source: src,
        extent: [
          each["coordinates"][0],
          each["coordinates"][1],
          each["coordinates"][0] + 1000000,
          each["coordinates"][1] + 1000000,
        ],
      });
      lay.set("ref", each["ref"]);

      layers.push(lay);
    });

    const worldMap = new Map({
      target: mapElement.current,
      layers: layers,
      controls: defaultControls().extend([new PencilOrHandControl()]),
      view: new View({
        minZoom: 3,
        maxZoom: 11,
        center: [0, 0],
        zoom: 3,
        extent: new View().getProjection().getExtent(),
      }),
    });

    /**
     * Add Interactions
     */
    worldMap.addOverlay(buyOverlay);
    worldMap.addOverlay(infoOverlay);

    // Stors mouse coordinates as the mouse moves
    worldMap.on("pointermove", (ev) => {
      mouseCoord.current = ev.pixel;
    });

    // Shows info of each image
    worldMap.on("click", (ev) => {
      let pixel = worldMap.getEventPixel(ev.originalEvent);
      let ref = "";
      worldMap.forEachLayerAtPixel(pixel, (layer) => {
        if (layer.get("ref")) {
          ref = layer.get("ref");
        }
      });
      if (ref) {
        infoOverlay.setPosition(ev.coordinate);
        infoOverlayElement.current.innerHTML = ref;
      } else {
        infoOverlay.setPosition(null);
      }
    });

    // User can select pixels on the map
    const draw = new Draw({
      source: drawSource,
      type: "Circle",
      geometryFunction: createBox(),
    });
    // When user starts drawing on the map, detect whether he clicked on the land and allow to start draws
    draw.on("drawstart", function () {
      drawSource.clear();
      buyOverlay.setPosition(null);
      var flag = false;
      worldMap.forEachFeatureAtPixel(
        mouseCoord.current,
        function (feature, layer) {
          var props = feature.getProperties();
          if (props.layer === "land") {
            flag = true;
          }
        }
      );
      if (!flag) draw.abortDrawing();
    });
    drawSource.on("addfeature", function (ev) {
      var flag = false;
      worldMap.forEachFeatureAtPixel(
        mouseCoord.current,
        function (feature, layer) {
          var props = feature.getProperties();
          if (props.layer === "land") {
            flag = true;
          }
        }
      );

      if (!flag) {
        drawSource.clear();
        buyOverlay.setPosition(null);
      } else {
        const extent = ev.feature.getGeometry().getExtent();
        const [x1, y1, x2, y2] = [
          Math.ceil(extent[0] / 10000),
          Math.ceil(extent[1] / 10000),
          Math.ceil(extent[2] / 10000),
          Math.ceil(extent[3] / 10000),
        ];
        if ((x1 - x2) * (y1 - y2) !== 0) {
          if (accountRef.current) {
            buyOverlay.setPosition([extent[2], extent[3]]);
            buyOverlayElement.current.innerHTML = `
              <p>${Math.abs(x1 - x2)} * ${Math.abs(y1 - y2)} * ${
              Config.pixelPrice
            } = ${(
              Config.pixelPrice *
              Math.abs(x1 - x2) *
              Math.abs(y1 - y2)
            ).toFixed(3)}ETH </p>
              <button onclick="doMint(${x1}, ${y1}, ${x2}, ${y2})"> BUY </button>
            `;
          }
        } else {
          alert("Select larger than a pixel");
          drawSource.clear();
          buyOverlay.setPosition(null);
        }
      }
    });
    draw.setActive(false)
    worldMap.addInteraction(draw);
  }, []);

  return (
    <div className="App">
      <div ref={mapElement} className="map-container"></div>
      <div ref={buyOverlayElement} className="overlay-container"></div>
      <div ref={infoOverlayElement} className="overlay-container"></div>
    </div>
  );
}

export default Lands;
