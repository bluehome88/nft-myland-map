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
        if (res) alert("Success");
        else alert("Failed");
      });
    } else {
      alert("Insufficient Funds");
    }
  };

  useEffect(() => {
    if (!window.doMint) window.doMint = doMint;

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
      worldMap.forEachFeatureAtPixel(mouseCoord.current, function (feature, layer) {
        var props = feature.getProperties();
        if (props.layer === "land") {
          flag = true;
        }
      });
      if (!flag) draw.abortDrawing();
    });
    drawSource.on("addfeature", function (ev) {
      var flag = false;
      worldMap.forEachFeatureAtPixel(mouseCoord.current, function (feature, layer) {
        var props = feature.getProperties();
        if (props.layer === "land") {
          flag = true;
        }
      });

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
        } else {
          alert("Select larger than a pixel");
          drawSource.clear();
          buyOverlay.setPosition(null);
        }
      }
    });
    if ( ! accountRef.current) {
      draw.setActive(false)
      const timer = setInterval(
        () => {
          if (accountRef.current) {
            draw.setActive(true)
            clearInterval(timer)
          }
        },
        1000
      )
    }
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
