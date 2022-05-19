import "./style.css"
// import { Button, Typography, message } from "antd";
import React, { useState, useEffect, useRef } from 'react';
// import Web3Context from "../store/web3Context";
// import Web2Context from "../store/web2Context";
// import SvgMap from "../components/SvgMap";
// import NftView from "../components/NftView";
// import { coordToTokenId } from "../utils";
// import config from "../config.js";


import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
// import VectorSource from 'ol/source/Vector'
// import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';
import Draw, { createBox } from "ol/interaction/Draw";
// import { defaults as defaultControls } from "ol/control";
import { OSM, Vector as VectorSource, TileDebug } from "ol/source";

function Home(props) {

  // set intial state
  const [ map, setMap ] = useState()
  // const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()

  // pull refs
  const mapElement = useRef()
  
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {

    const sourceLayer = new VectorSource({ wrapX: false });
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: sourceLayer
    })

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new TileLayer({
          source: new TileDebug()
        }),
        initalFeaturesLayer
      ],
      view: new View({
        minZoom: 3,
        maxZoom: 11,
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2,
        extent: new View().getProjection().getExtent()
      }),
      controls: []
    })

    // set map onclick handler
    initialMap.on('click', handleMapClick)

    // save map and vector layer references to state
    setMap(initialMap)
    // setFeaturesLayer(initalFeaturesLayer)

    initialMap.addInteraction(new Draw({
      source: sourceLayer,
      type: "Circle",
      geometryFunction: createBox()
    }));

  },[])

  // map click handler
  const handleMapClick = (event) => {
  console.log(event)    
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord( transormedCoord )
    
  }

  // render component
  return (      
    <div className='App'>
      
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>

    </div>
  ) 

}

export default Home

// export default function Home(props) {
//   const [visible, setVisible] = useState(false);
//   const [tokenId, setTokenId] = useState(null);

//   const {
//       initWeb3Modal,
//       loading,
//       loadingBuy,
//       loadingPrice,
//       loadingCount,
//       nftPrice,
//       nftCount,
//       countLifePixel,
//       getPixelPrice,
//       purchasePixel,
//       openSeaLink,
//   } = useContext(Web3Context);

//   const {
//       loadingColors,
//       nftTokens,
//       getTokens,
//   } = useContext(Web2Context);

//   // Get Colors Pixels
//   useEffect(() => {
//     if (!nftTokens) {
//       getTokens();
//     }
//   }, [])

//   const handleClickPixel = (coord) => {
//     const tkId = coordToTokenId(coord.x, coord.y, config.xNum);
//     setTokenId(tkId);
//     getPixelPrice(tkId);
//     countLifePixel(tkId);
//     setVisible(true);
//   }

//   const successBuy = async (success) => {
//     if (success)
//       message.success('You successfully get this token.');
//     else
//       message.error('A error happened. Do you have enough in your balance ?');
//     setVisible(false);

//     // update grid
//     getTokens();
//   }

//   const confirmBuy = (color) => {
//     purchasePixel(tokenId, color, successBuy);
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         width: "100%",
//         minHeight: '70vh',
//       }}
//     >
//       {props.isLogged && visible && 
//         <NftView 
//           tokenId={tokenId}
//           loading={loadingBuy}
//           visible={visible}
//           setVisible={setVisible}
//           confirmBuy={confirmBuy}
//           nftPrice={nftPrice}
//           loadingPrice={loadingPrice}
//           nftCount={nftCount}
//           loadingCount={loadingCount}
//           openSeaLink={openSeaLink}
//         />}

//       {!loading && (
//         <>
//           <SvgMap
//             width={window.innerWidth}
//             height={window.innerHeight - 50}
//             sizeBox={config.sizeBox}
//             paddBox={config.paddBox}
//             xNum={config.xNum}
//             yNum={config.yNum}
//             onClick={handleClickPixel}
//             reload={getTokens}
//             loading={loadingColors}
//             nftTokens={nftTokens}
//           />
//         </>
//       )}
      
//       {loading && (
//         <Button type="primary" style={{ margin: 'auto' }} loading>
//           Loading
//         </Button>
//       )}
//     </div>
//   );
// }
