import ImageResizer from "react-native-image-resizer";
// import RNFS from 'react-native-fs';
import AsyncStorage from "@react-native-async-storage/async-storage";
export const ImageCompressor = async (path) => {

    try {
        let resizedImage;
        resizedImage = await ImageResizer.createResizedImage(
            `${path}`,
            800, // new width
            600, // new height
            'JPEG', // format
            80, // quality
        );

        const total_size = resizedImage?.size; // depends on ImageResizer size
        const required_size = 24000;
        let percentage = 80;

        if (required_size < total_size) {
            percentage = Math.floor((required_size / total_size) * 100);
            resizedImage = await ImageResizer.createResizedImage(
                `${path}`,
                800, // new width
                600, // new height
                'JPEG', // format
                percentage, // quality
            );
        }

        // const base64Image = await RNFS.readFile(resizedImage?.uri, 'base64');
        // AsyncStorage.setItem('image',base64Image)
        return resizedImage?.uri;
    } catch (err) {
        console.log(" ImageCompressor  > ", err);

    }

}