import "./style.css"
import { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import {toStringXY} from 'ol/coordinate';
import Draw, { createBox } from "ol/interaction/Draw";
import { Snap } from 'ol/interaction';
import Feature from 'ol/Feature';
import { Circle as CircleStyle, Fill, Style } from 'ol/style';
import { Point } from 'ol/geom';
import { OSM, Vector as VectorSource } from "ol/source";
import NftView from "../components/NftView";

// import Web3Context from "../store/web3Context";
// import Web2Context from "../store/web2Context";
// import SvgMap from "../components/SvgMap";
// import { coordToTokenId } from "../utils";
// import config from "../config.js";
// import { Button, Typography, message } from "antd";

function Home(props) {
  const [ map, setMap ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()
  const [visible, setVisible] = useState(false)

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map
  
  useEffect( () => {
    const points = [];
    let count = 0;
    for (let i = -20000000; i <= 20000000; i += 2000000) {
      for (let j = -20000000; j <= 20000000; j += 2000000) {
        points[count] = new Feature({
          'geometry': new Point([i, j])
        });
        count++;
      }
    }
    const pointsSource = new VectorSource({
      features: points,
      wrapX: false,
    });
    const pointsLayer = new VectorLayer({
      source: pointsSource,
      style: new Style({
        image: new CircleStyle({
          radius: 1,
          fill: new Fill({ color: '#ff0000' }),
        }),
      })
    });

    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        pointsLayer
      ],
      view: new View({
        minZoom: 3,
        maxZoom: 11,
        center: [0, 0],
        zoom: 3,
        extent: new View().getProjection().getExtent()
      }),
      controls: []
    })
    setMap(initialMap)
    initialMap.on('pointermove', handleMapClick)

    const draw = new Draw({
      source: pointsSource,
      type: "Circle",
      geometryFunction: createBox()
    })
    draw.on('drawend', function (ev) {
      const features = pointsLayer.getFeatures()
      var lastFeature = features[features.length - 1];
      pointsLayer.removeFeature(lastFeature);
      console.log(ev)
      setVisible(true)
    })
    initialMap.addInteraction(draw);

    const snap = new Snap({
      source: pointsSource,
      pixelTolerance: 100
    });
    initialMap.addInteraction(snap);   
  },[])

  const handleMapClick = (event) => {
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    setSelectedCoord(clickedCoord)
  }

  return (
    <div className='App'>
      <div ref={mapElement} className="map-container"></div>
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
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
