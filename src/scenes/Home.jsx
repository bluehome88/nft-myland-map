import "./style.css"
import 'ol/ol.css';
import { useState, useEffect, useRef } from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector';
import Draw, { createBox } from "ol/interaction/Draw";
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { OSM, Vector as VectorSource } from "ol/source";
import MVT from 'ol/format/MVT';
import NftView from "../components/NftView";

var lastCoord;
function Home(props) {
  const [ map, setMap ] = useState()
  const [visible, setVisible] = useState(false)

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map
  
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

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        landLayer,
        drawLayer
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
    initialMap.on('pointermove', (ev) => {
      lastCoord = ev.pixel
    })

    const draw = new Draw({
      source: drawSource,
      type: "Circle",
      geometryFunction: createBox()
    })

    draw.on('drawstart', function () {
      drawSource.clear()
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
      var flag = false
      initialMap.forEachFeatureAtPixel(lastCoord, function (feature, layer) {
        var props = feature.getProperties();
        if (props.layer === 'land') {
          flag = true;
        }
      })
      if (!flag)
        drawSource.clear()
    })
    initialMap.addInteraction(draw);
  },[])

  return (
    <div className='App'>
      <div ref={mapElement} className="map-container"></div>
      <div className="clicked-coord-label">
        {props.isLogged && visible &&
          <NftView
            tokenId={1}
            loading={1}
            visible={visible}
            setVisible={setVisible}
            confirmBuy={console.log(123)}
            nftPrice={1}
            loadingPrice={1}
            nftCount={2}
            loadingCount={1}
            openSeaLink="12"
          />}
      </div>
    </div>
  ) 
}

export default Home
