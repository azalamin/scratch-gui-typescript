import { Base64 } from 'js-base64';
import blockToImage from './block-to-image';
import jpegThumbnail from './jpeg-thumbnail';

const codePayload = async ({ blockObjects, topBlockId }: any) => {
  const payload: any = {
    type: 'script', // Needs to match backpack-server type name
    name: 'code', // All code currently gets the same name
    mime: 'application/json',
    // Backpack expects a base64 encoded string to store. Cannot use btoa because
    // the code can contain characters outside the 0-255 code-point range supported by btoa
    body: Base64.encode(JSON.stringify(blockObjects)), // Base64 encode the json
  };

  const dataUrl = await blockToImage(topBlockId);
  const thumbnail = await jpegThumbnail(dataUrl);
  payload.thumbnail = thumbnail.replace('data:image/jpeg;base64,', '');
  return payload;
};

export default codePayload;
