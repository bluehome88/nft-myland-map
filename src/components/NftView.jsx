import React, { useContext } from 'react';
import { ColorPicker, useColor } from "react-color-palette";
import { Steps, Modal, Button, Typography } from 'antd';
import Icon, { ConsoleSqlOutlined, LoadingOutlined } from '@ant-design/icons';
import "react-color-palette/lib/css/styles.css";
import "./NftView.css";
import Web3Context from "../store/web3Context";
const { Step } = Steps;

// props.tokenId
// props.confirmBuy
// props.visible
// props.setVisible
// props.loading
// props.nftPrice
// props.loadingPrice
// props.nftCount
// props.loadingCount
// props.openSeaLink
function NftView(props) {
	const {
		buyLands,
		account
	  } = useContext(Web3Context);
	const [color, setColor] = useColor("hex", "#121212");
	const [isBuy, setIsBuy] = React.useState(false);
	const [current, setCurrent] = React.useState(0);
	const { rect } = props
	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	const handleConfirm = async () => {
		const rgbArr = [
			color.rgb.r,
			color.rgb.g,
			color.rgb.b,
		];
		// await props.confirmBuy(rgbArr);
	}

	const steps = [
		{
			title: 'Choose a color',
			content: <ColorPicker width={456} height={228} color={color} onChange={setColor} hideHSV dark />,
		},
		{
			title: 'Confirm',
			content: (
				<>
					<Typography>Color choosed: {color.hex}</Typography>
				</>
			),
		},
	];

	const doMint = () => {
		buyLands(rect[0], rect[1], rect[2], rect[3], (res) => {
			if (res)
				alert('Success')
			else
				alert('Failed')
		})
	}

	return (
		<Modal
			title={'Press Mint Button to buy selectd area'}
			style={{
				right: 0,
				width: '20%',
				position: 'fixed',
				top: 0,
				bottom: 0,
			}}
			bodyStyle={{ height: 'calc(100vh - 68px)' }}
			visible={props.visible}
			onCancel={() => props.setVisible(false)}
			footer={[]}
		>
			<p>([{props.rect[0]}, {props.rect[1]}], [{props.rect[2]}, {props.rect[3]}])</p>
			<button onClick={doMint}>Mint</button>
			{/* {props.loading && <div>
				<Icon component={LoadingOutlined} />
				<Typography>Careful, processing on chain, can take severals seconds...</Typography>
			</div>}
			{!props.loading && 
				<>
					{!isBuy && <div>
						<Typography>Price: {props.loadingPrice ? <Icon component={LoadingOutlined} /> : props.nftPrice + 'ETH'}</Typography>
						<Typography>How many owner(s) get this NFT ?: {props.loadingCount ? <Icon component={LoadingOutlined} /> : props.nftCount}</Typography>
						{props.nftCount && props.openSeaLink ? <Typography>Check it on <a href={props.openSeaLink + props.tokenId}>OpenSea</a></Typography> : null}
						
						<Typography style={{ marginTop: '10px' }}>Want it ?</Typography>
						<Button style={{ width: '100%' }} type="primary" onClick={!props.loadingPrice && !props.loadingCount ? () => setIsBuy(true) : () => {}}>
							{!props.loadingPrice && !props.loadingCount ? 'Buy it' : <Icon component={LoadingOutlined} />}
						</Button>
						<Typography>Limitation: 1 buy by minute.</Typography>
					</div>}

					{isBuy && <>
							<Steps current={current}>
								{steps.map(item => (
									<Step key={item.title} title={item.title} />
								))}
							</Steps>
							<div className="steps-content">{steps[current].content}</div>


							<div className="steps-action">
								{current < steps.length - 1 && (
									<Button type="primary" onClick={() => next()}>
										Next
									</Button>
								)}
								{current === steps.length - 1 && (
									<Button type="primary" onClick={() => handleConfirm()}>
										Confirm
									</Button>
								)}
								{current > 0 && (
									<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
										Previous
									</Button>
								)}
							</div>
						</>
					}
				</>
			} */}
		</Modal>
	);
}

export default NftView;
