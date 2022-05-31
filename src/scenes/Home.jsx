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
import { OSM, Vector as VectorSource } from "ol/source";
import Overlay from 'ol/Overlay';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import NftView from "../components/NftView";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";

var lastCoord;
const geo = [{
  "coordinates": [
    300000,
    4343403
  ],
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
},
{
  "coordinates": [
    325003.397359,
    50000.328235
  ],
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
}]
function Home(props) {
  const { onePixelCost, buyLands, account } = props
  const [map, setMap] = useState()
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState(false)
  const mapElement = useRef()
  const overlayElement = useRef()
  const infoElement = useRef()
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

  const getFeatureStyle = (feature, resolution, sel) => {
    console.log('********', feature, sel)
    if (feature.get('img')) {
      const style = new Style({
        image: new Icon({
          src: feature.get("img"),
          imgSize: [10, 3]
          // radius: 1,
          // crop: true,
          // stroke: new Stroke({
          //   width: 3 + (sel ? 3 : 0),
          //   color: sel ? 'red' : 'blue'
          // })
        })
      });
      return [style];
    } else {
      return new Style()
    }
  }

  if (!window.doMint)
    window.doMint = doMint
  useEffect(() => {
    const landSource = new VectorTileSource({
      format: new MVT(),
      url: 'https://api.maptiler.com/tiles/land/{z}/{x}/{y}.pbf?key=oNZwiLnC8cX8YW6850yV',
    });
    const landLayer = new VectorTileLayer({
      source: landSource
    });
    const drawSource = new VectorSource({ wrapX: false });
    const drawLayer = new VectorLayer({ source: drawSource });
    const buyOverlay = new Overlay({
      element: overlayElement.current,
      positioning: "top-left",
      offset: [2, 0]
    })
    const infoOverlay = new Overlay({
      element: infoElement.current,
      positioning: "top-left",
      offset: [2, 0]
    })

    var layers = [
      new TileLayer({
        source: new OSM()
      }),
      landLayer,
      drawLayer,
      // imageLayer
    ]
    geo.forEach((i, j) => {
      const src = new Static({
        url: i['img'],
        imageExtent: [i['coordinates'][0], i['coordinates'][1], i['coordinates'][0] + 100000, i['coordinates'][1] + 100000],
      })
      const lay = new ImageLayer({
        source: src,
        extent: [i['coordinates'][0], i['coordinates'][1], i['coordinates'][0] + 100000, i['coordinates'][1] + 100000]
      })
      lay.set('ref', i['ref'])
      layers.push(lay)
    })
    const initialMap = new Map({
      target: mapElement.current,
      layers: layers,
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
    initialMap.addOverlay(infoOverlay)

    initialMap.on('click', (ev) => {
      console.log(ev.coordinate)
      let pixel = initialMap.getEventPixel(ev.originalEvent);
      let ref = ''
      initialMap.forEachLayerAtPixel(pixel, (layer, rgb) => {
        if (layer.get('ref')) {
          ref = layer.get('ref')
        }
      })
      if (ref) {
        buyOverlay.setPosition(ev.coordinate)
        overlayElement.current.innerHTML = ref
      }
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

    drawSource.on('addfeature', function (ev) {
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

    // const select = new Select({
    //   condition: click,
    //   style: function (feature, resolution) { console.log('++++++++++', feature); return getFeatureStyle(feature, resolution, true); }
    // })
    // initialMap.addInteraction(select);
  }, [])

  return (
    <div className='App'>
      <div ref={mapElement} className="map-container"></div>
      <div ref={overlayElement} className="overlay-container">123123</div>
      <div ref={infoElement} className="overlay-container">123123</div>
      <div className="clicked-coord-label"></div>
    </div>
  )
}

export default Home
