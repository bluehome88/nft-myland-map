import axios from 'axios';
import Config from './config';


const onMint = async (tokenId, cbk) => {
    const endPoint = Config.API_URL + 'add';
    try {
        const res = await axios.post(endPoint, {
            tokenId: tokenId
        });
        console.log(res);
        if (cbk)
            cbk(res);
    } catch (err) {
        console.log(err);
    }
}

export {onMint};