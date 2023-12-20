import "core-js/stable";
import "regenerator-runtime/runtime";
import * as tf from '@tensorflow/tfjs';
import image1URL from './image1.jpg';
import image2URL from './image2.jpg';


const modelURL = "https://raw.githubusercontent.com/srishti-buyume/vto-models/main/loreal/model.json"

let modelPromise;

window.onload = () => modelPromise = tf.loadGraphModel(modelURL);

const button = document.getElementById('toggle');
button.onclick = () => {
  image.src = image.src.endsWith(image1URL) ? image2URL : image1URL;
};

const image = document.getElementById('image');
image.src = image1URL;

const runButton = document.getElementById('run');


runButton.onclick = async () => {

    const model = await modelPromise;
    const pixels = tf.browser.fromPixels(image).toFloat();

    const input1 = tf.tensor([3.14], [], 'float32')
    const input2 = pixels.reshape([1, ...pixels.shape]);
    const output = await model.executeAsync({ 'inputs_1': input1, 'inputs_0': input2 });
 
    const maskTensor = output[1];
    const maskData = await maskTensor.data();
    const maskArray = Array.from(maskData);
    const maskShape = maskTensor.shape;
    // console.log("Mask Tensor", maskTensor, "Mask Data", maskData, "Mask Array", maskArray, "Mask Shape", maskShape);

    // Convert the mask array to an RGBA array
    const rgbaArray = maskArray.flatMap(value => [value, value, value, 255]);
    const maskImage = new ImageData(new Uint8ClampedArray(rgbaArray), maskShape[2], maskShape[1]);
   

    // Create a canvas
    const canvas = document.getElementById('canvas');
    canvas.width = maskShape[2];
    canvas.height = maskShape[1];
    const ctx = canvas.getContext('2d');

    let legendColors = [ 
        [90, 30, 31, 200], 
        [32, 92, 153, 200],
        [10, 10, 10, 150] 
    ]; 
    const baseColor = { r: legendColors[1][0], g: legendColors[1][1], b: legendColors[1][2], a: 0.7 } ; 
    ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
    ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;


    // Draw the input image on the canvas
    ctx.drawImage(image, 0, 0, maskShape[2], maskShape[1]);


    // Get the pixel data from the segmentation mask
    const maskData2 = maskImage.data;
    const threshold = 125; 
  
    // Iterate through each pixel of the segmentation mask
    for (let i = 0; i < maskData2.length; i += 4) {
      if (maskData2[i] > threshold) {
        ctx.fillRect((i / 4) % maskImage.width, Math.floor((i / 4) / maskImage.width), 1, 1);
      }
    };


    // Cleanup
    tf.dispose([maskTensor]);


};