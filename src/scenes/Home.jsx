import "./style.css"
import 'ol/ol.css';
import { useState, useContext, useEffect, useRef } from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector';
import Draw, { createBox } from "ol/interaction/Draw";
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
// import * as Photo from 'ol-ext/style';
import Photo from 'ol-ext/style/Photo';
// import * as Ha fr/om 'ol-ext/style'
import { OSM, Vector as VectorSource } from "ol/source";
import Overlay from 'ol/Overlay';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import NftView from "../components/NftView";
console.log(Photo)
var lastCoord;
const geo = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          3.288604,
          49.719955
        ]
      },
      "properties": {
        "ref": "APD0004328",
        "cpost": "02440",
        "region": "Picardie",
        "dep": "2",
        "commune": "Remigny",
        "text": "Camouflage avec les moyens de fortune",
        "author": "Opérateur D ; Brissy, Edouard",
        "date": "1917/06/16",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'Architecture et du Patrimoine - Diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1599/sap40_d0004328_v.jpg"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          3.397359,
          50.328235
        ]
      },
      "properties": {
        "ref": "APD0005719",
        "cpost": "59220",
        "region": "Nord-Pas-de-Calais",
        "dep": "59",
        "commune": "Denain",
        "text": "Visite de la délégation de la Conférence de la paix à l'entrée",
        "author": "Opérateur D ; Sélince",
        "date": "1919/04/06",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'Architecture et du Patrimoine - Diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1600/sap40_d0005719_v.jpg"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          4.544417,
          49.184081
        ]
      },
      "properties": {
        "ref": "APTH002327",
        "cpost": "51600",
        "region": "",
        "dep": "51",
        "commune": "Souain-Perthes-lès-Hurlus",
        "text": "Prisonniers allemands au bord de la route",
        "author": "Opérateur Théta (code armée, photographe)",
        "date": "1918/10/09",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'architecture et du patrimoine - diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1103/sap40_th002327_v.jpg"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          4.730952,
          49.224849
        ]
      },
      "properties": {
        "ref": "APTH002364",
        "cpost": "51800",
        "region": "",
        "dep": "51",
        "commune": "Ripont",
        "text": "Emplacement du village",
        "author": "Opérateur Théta (code armée, photographe)",
        "date": "1918/10/02",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'architecture et du patrimoine - diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1103/sap40_th002364_v.jpg"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          3.536178,
          49.245893
        ]
      },
      "properties": {
        "ref": "APTH002125",
        "cpost": "02130",
        "region": "",
        "dep": "2",
        "commune": "Vaux",
        "text": "Prisonniers allemands faisant la moisson",
        "author": "Opérateur Théta (code armée, photographe)",
        "date": "1918/08/24",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'architecture et du patrimoine - diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1103/sap40_th002125_v.jpg"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          4.317766,
          49.298128
        ]
      },
      "properties": {
        "ref": "APTH002382",
        "cpost": "51490",
        "region": "",
        "dep": "51",
        "commune": "Pontfaverger",
        "text": "Ruines",
        "author": "Opérateur Théta (code armée, photographe)",
        "date": "1918/09/10",
        "copy": "Ministère de la Culture (France) - Médiathèque de l'architecture et du patrimoine - diffusion RMN",
        "img": "http://www.culture.gouv.fr/Wave/image/memoire/1103/sap40_th002382_v.jpg"
      }
    }
  ]
}
function Home(props) {
  const { onePixelCost, buyLands, account } = props
  const [ map, setMap ] = useState()
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState(false)
  const mapElement = useRef()
  const overlayElement = useRef()
  const price = useRef()
  const myAccount = useRef()
  const buyLandsRef = useRef()
  price.current = onePixelCost
  myAccount.current = account
  buyLandsRef.current = buyLands

  const doMint = (x1, y1, x2, y2) => {
    console.log(myAccount.current.balance)
    console.log(Math.abs(x1 - x2) * Math.abs(y1 - y2) * price.current)
    if (myAccount.current && parseFloat(myAccount.current.balance) >= Math.abs(x1 - x2) * Math.abs(y1 - y2) * price.current) {
      buyLandsRef.current(x1, y1, x2, y2, (res) => {
        if (res)
          alert('Success')
        else
          alert('Failed')
      })
    } else {
      alert('Insufficient Funds')
    }
  }

  var styleCache = {};
  const getFeatureStyle = (feature, resolution, sel) => {
    var k = "default_3_" + feature.get("img").match(/[^\\/]+$/)[0] + "_0_0";
    console.log(k)
    if (styleCache && styleCache[k]) {
      return [styleCache[k]];
    } else {
      styleCache[k] = new Style({
        image: new Photo({
          src: feature.get("img"),
          radius: 20,
          // crop: $("#crop").prop('checked'),
          // kind: $('#kind').val(),
          // shadow: $("#shadow").prop('checked')?5:0,
          // onload: function() { vector.changed(); },
          stroke: new Stroke({
            width: 3 + (sel ? 3 : 0),
            color: sel ? 'red' : '#fff'
          })
        })
      });
    }
  }

  if (!window.doMint)
    window.doMint = doMint
  useEffect( () => {
    const landSource = new VectorTileSource({
      format: new MVT(),
      url: 'https://api.maptiler.com/tiles/land/{z}/{x}/{y}.pbf?key=oNZwiLnC8cX8YW6850yV',
    });
    const landLayer = new VectorTileLayer({
      source: landSource
    });
    const drawSource = new VectorSource({ wrapX: false });
    const drawLayer = new VectorLayer({source: drawSource});
    const buyOverlay = new Overlay({
      element: overlayElement.current,
      positioning: "top-left",
      offset: [2, 0]
    })

    const imageSource = new VectorSource({
      features: new GeoJSON().readFeatures(geo),
      projection: 'EPSG:3857',
      attributions: ["&copy; <a href='https://data.culture.gouv.fr/explore/dataset/fonds-de-la-guerre-14-18-extrait-de-la-base-memoire'>data.culture.gouv.fr</a>"],
      logo: "https://www.data.gouv.fr/s/avatars/37/e56718abd4465985ddde68b33be1ef.jpg"
    });
    var imageLayer = new VectorLayer({
      name: '1914-18',
      preview: "http://www.culture.gouv.fr/Wave/image/memoire/2445/sap40_z0004141_v.jpg",
      source: imageSource,
      // y ordering
      // renderOrder: ol.ordering.yOrdering(),
      style: getFeatureStyle
    });
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        landLayer,
        drawLayer,
        imageLayer
      ],
      view: new View({
        minZoom: 3,
        maxZoom: 11,
        center: [0, 0],
        zoom: 3,
        extent: new View().getProjection().getExtent()
      }),
    })
    setMap(initialMap)
    initialMap.addOverlay(buyOverlay)

    initialMap.on('click', (ev) => {
      console.log('click', Date.now())
    })

    initialMap.on('pointermove', (ev) => {
      lastCoord = ev.pixel
    })

    const draw = new Draw({
      source: drawSource,
      type: "Circle",
      geometryFunction: createBox()
    })

    // When user starts drawing on the map, detect whether he clicked on the land and allow to start draws
    draw.on('drawstart', function () {
      console.log('=========================')
      console.log('drawstart', Date.now())
      drawSource.clear()
      buyOverlay.setPosition(null)
      var flag = false
      initialMap.forEachFeatureAtPixel(lastCoord, function (feature, layer) {
        var props = feature.getProperties();
        if (props.layer === 'land') {
          flag = true;
        }
      })
      if (!flag)
        draw.abortDrawing()
    })

    drawSource.on('addfeature', function(ev) {
      console.log('addfeature', Date.now())
      var flag = false
      initialMap.forEachFeatureAtPixel(lastCoord, function (feature, layer) {
        var props = feature.getProperties();
        if (props.layer === 'land') {
          flag = true;
        }
      })
      if (!flag) {
        drawSource.clear()
        buyOverlay.setPosition(null)
      }
      else {
        const extent = ev.feature.getGeometry().getExtent()
        const [x1, y1, x2, y2] = [Math.ceil(extent[0] / 100000), Math.ceil(extent[1] / 100000), Math.ceil(extent[2] / 100000), Math.ceil(extent[3] / 100000)]
        if ((x1 - x2) * (y1 - y2) != 0) {
          setVisible(true)
          buyOverlay.setPosition([extent[2], extent[3]])
          overlayElement.current.innerHTML = `
            <p>${Math.abs(x1 - x2)} * ${Math.abs(y1 - y2)} * ${price.current} = ${(price.current * Math.abs(x1 - x2) * Math.abs(y1 - y2)).toFixed(3)}ETH </p>
            <button onclick="doMint(${x1}, ${y1}, ${x2}, ${y2})"> BUY </button>
          `

        } else {
          drawSource.clear()
          buyOverlay.setPosition(null)
        }
      }
    })

    draw.on('drawend', function () {
      console.log('drawend', Date.now())
    })

    initialMap.addInteraction(draw);
  },[])

  return (
    <div className='App'>
      <div ref={mapElement} className="map-container"></div>
      <div ref={overlayElement} className="overlay-container">123123</div>
      <div className="clicked-coord-label"></div>
    </div>
  ) 
}

export default Home
