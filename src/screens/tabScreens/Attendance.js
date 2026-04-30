import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import ImageCompressor from 'react-native-compressor';
import { Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTaskRequest,
  clockinRequest,
  clockoutRequest,
  municipalityRegisterRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import constants from '../../utils/helpers/constants';
let status = '';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate square dimensions for face capture
const SQUARE_SIZE = SCREEN_WIDTH * 0.8; // 80% of screen width
const SQUARE_TOP = (SCREEN_HEIGHT - SQUARE_SIZE) / 2 - 50; // Center with slight offset

const Attendence = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  // Camera state
  const [cameraPosition, setCameraPosition] = useState('front');
  const device = useCameraDevice(cameraPosition);
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);

  // Get location data from params
  const currentAddress = props?.route?.params?.currentAddress;
  const latitude = props?.route.params?.latitude;
  const longitude = props?.route.params?.longitude;
  const attendenceStatus = props?.route?.params?.attendenceStatus;
console.log("attendenceStatus>>>",attendenceStatus);

  // UI state
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [finalImage, setFinalImage] = useState('');
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address and coordinates
  const locationData = {
    address: currentAddress,
    latitude: latitude,
    longitude: longitude,
  };

  useEffect(() => {
    checkPermission();

    // Update date time every second
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString();
    setCurrentDateTime(`${formattedDate} ${formattedTime}`);
  };

  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
  };

  const toggleCameraPosition = () => {
    setCameraPosition(cameraPosition === 'front' ? 'back' : 'front');
  };

  const takePicture = async () => {
    if (cameraRef.current !== null && !isProcessing) {
      setIsProcessing(true);

      try {
        // Take photo with higher quality for better cropping
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          quality: 0.9,
          flash: flash,
        });

        // Set preview image for overlay
        const previewUri = `file://${photo.path}`;
        setPreviewImage(previewUri);

        // Show fullscreen preview
        setShowFullScreenPreview(true);

        // First show the image without overlay
        setTimeout(() => {
          // Then show the overlay after 1 second
          setShowOverlay(true);
          setIsProcessing(false);
        }, 1000);
      } catch (error) {
        console.error('Error during image capture:', error);
        setIsProcessing(false);
      }
    }
  };

  function onClockIn(capturedimage) {
    const imageName = capturedimage.split('/').pop();
    const imageType = 'image/jpeg';
    const formData = new FormData();
    // formData.append('app_version', constants.APP_VERSION);
    formData.append('check_in', moment().format('HH:mm:ss'));
    // formData.append('status', attendenceStatus);
    formData.append('check_in_latitude', latitude);
    formData.append('check_in_longitude', longitude);
    // formData.append('check_in_address', locationData?.address);
    // formData.append('remarks', isInsideOffice);
    formData.append('check_in_photo', {
      uri:
        Platform.OS === 'android'
          ? capturedimage
          : capturedimage.replace('file://', ''),
      name: imageName,
      type: imageType,
    });

    connectionrequest()
      .then(() => {
        dispatch(clockinRequest(formData));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }
  function onClockOut(capturedimage) {
    const imageName = capturedimage.split('/').pop();
    const imageType = 'image/jpeg';
    const formData = new FormData();
    formData.append('check_out', moment().format('HH:mm:ss'));
    formData.append('check_out_latitude', latitude);
    formData.append('check_out_longitude', longitude);
    // formData.append('check_out_address', "test");
    // formData.append('check_out_remarks', check_out_remarks);
    formData.append('check_out_photo', {
      uri:
        Platform.OS === 'android'
          ? capturedimage
          : capturedimage.replace('file://', ''),
      name: imageName,
      type: imageType,
    });

    connectionrequest()
      .then(() => {
        dispatch(clockoutRequest(formData));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }

  const handleSubmit = async () => {
    setLoading(true);
    if (viewShotRef.current && !isSubmitting) {
      setIsSubmitting(true);

      try {
        let finalImagePath;
        // Capture the square view with overlay

        // Compress the captured image
        const capturedUri = await viewShotRef.current.capture();
        finalImagePath = await ImageCompressor.Image.compress(capturedUri, {
          compressionMethod: 'auto',
          quality: 0.8,
          input: 'uri',
          output: 'jpg',
        });
        setFinalImage(finalImagePath);
        if (props?.route?.params?.pagename == 'MyProfile') {
          props?.navigation.navigate('BottomTabNav', {
            screen: 'MyProfile',
            params: {
              finalImageUri: finalImagePath,
              isEditing: true,
            },
          });
          return;
        }
        // Handle clock in/out for attendance
        if (attendenceStatus == 'clockin') {
          onClockIn(finalImagePath);
        } else if (attendenceStatus == 'clockout') {
          onClockOut(finalImagePath);
        } else {
          console.log('hitting else');
        }
        console.log(
          'Final compressed square image with geotag:',
          finalImagePath,
        );
      } catch (error) {
        console.error('Error processing final image:', error);
        setIsSubmitting(false);
      }
    }
  };
  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/clockinRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/clockinSuccess':
        status = ProfileReducer.status;

        props?.navigation.navigate('BottomTabNav', {
          screen: 'Home',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;
      case 'Profile/clockinFailure':
        status = ProfileReducer.status;

        props?.navigation.navigate('BottomTabNav', {
          screen: 'Home',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;

      case 'Profile/clockoutRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/clockoutSuccess':
        status = ProfileReducer.status;
        props?.navigation.navigate('BottomTabNav', {
          screen: 'Home',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;
      case 'Profile/clockoutFailure':
        status = ProfileReducer.status;
        showErrorAlert('Clock Out fail due to Network issue, Try again!');

        props?.navigation.navigate('BottomTabNav', {
          screen: 'Home',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;

      case 'Profile/municipalityRegisterRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/municipalityRegisterSuccess':
        status = ProfileReducer.status;
        setLoading(false);

        props?.navigation.navigate('BottomTabNav', {
          screen: 'MuRegister',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;
      case 'Profile/municipalityRegisterFailure':
        status = ProfileReducer.status;
        setLoading(false);

        showErrorAlert('Task add fail due to Network issue, Try again!');

        props?.navigation.navigate('BottomTabNav', {
          screen: 'MuRegister',
          params: {
            finalImageUri: finalImage,
          },
        });
        break;
    }
  }
  const cancelCapture = () => {
    props?.navigation.goBack();
  };

  const retakePhoto = () => {
    setShowFullScreenPreview(false);
    setPreviewImage('');
    setShowOverlay(false);
    setIsProcessing(false);
  };

  if (!device)
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
      </View>
    );

  return (
    <View style={styles.fullScreenContainer}>
      <Loader visible={loading} />
      {/* Camera View with Square Frame */}
      {!showFullScreenPreview && (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            orientation="portrait"
            flash={flash}
            enableZoomGesture
            zoom={1.5} // Add zoom for closer face capture
          />

          {/* Camera Frame Overlay */}
          <View style={styles.cameraFrameContainer}>
            {/* Dark overlay for top */}
            <View style={styles.overlayTop} />

            {/* Middle section with square frame */}
            <View style={styles.middleSection}>
              <View style={styles.overlaySide} />
              <View style={styles.squareFrame}>
                <View style={[styles.frameCorner, styles.topLeft]} />
                <View style={[styles.frameCorner, styles.topRight]} />
                <View style={[styles.frameCorner, styles.bottomLeft]} />
                <View style={[styles.frameCorner, styles.bottomRight]} />

                {/* Instruction text */}
                <View style={styles.instructionContainer}>
                  <Text style={styles.instructionText}>
                    {props?.route?.params?.status == 'MuRegister'
                      ? 'Position your face in the frame'
                      : 'Position your face in the frame'}
                  </Text>
                </View>
              </View>
              <View style={styles.overlaySide} />
            </View>

            {/* Dark overlay for bottom with info */}
            <View style={styles.overlayBottom}>
              {props?.route?.params?.pagename != 'MyProfile' && (
                <View style={styles.infoContainer}>
                  <Text style={styles.dateTimeText}>{currentDateTime}</Text>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {currentAddress}
                  </Text>
                  <Text style={styles.coordsText}>
                    Lat: {locationData.latitude} | Long:{' '}
                    {locationData.longitude}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* Square Preview View with ViewShot */}
      {showFullScreenPreview && (
        <View style={styles.previewContainer}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'jpg',
              quality: 0.9,
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
            }}
            style={styles.squarePreview}
          >
            <Image
              source={{ uri: previewImage }}
              style={styles.squarePreviewImage}
              resizeMode="cover"
            />

            {/* Overlay with location details */}
            {showOverlay && props?.route?.params?.pagename != 'MyProfile' && (
              <View style={styles.previewOverlay}>
                <View style={styles.previewInfoContainer}>
                  <Text style={styles.previewDateTime}>{currentDateTime}</Text>
                  <Text style={styles.previewAddress} numberOfLines={2}>
                    {currentAddress}
                  </Text>
                  <Text style={styles.previewCoords}>
                    Lat: {locationData.latitude} | Long:{' '}
                    {locationData.longitude}
                  </Text>
                </View>
              </View>
            )}
          </ViewShot>
        </View>
      )}

      {/* Camera Controls - Header */}
      <View style={styles.cameraHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={cancelCapture}>
          <Image
            resizeMode="contain"
            style={styles.iconImage1}
            source={Images.close}
          />
        </TouchableOpacity>

        {!showFullScreenPreview && (
          <TouchableOpacity
            style={styles.switchCameraButton}
            onPress={toggleCameraPosition}
          >
            <View style={styles.iconButton}>
              <Image style={styles.iconImage} source={Images.refreshicon} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Camera Controls - Footer */}
      <View style={styles.cameraFooter}>
        {!showFullScreenPreview && !isProcessing && (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}

        {showFullScreenPreview && showOverlay && (
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={[
                styles.retakeButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={retakePhoto}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingIndicator}>
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Attendence;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    position: 'relative',
  },

  // Camera Frame Styles
  cameraFrameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    maxHeight: SQUARE_TOP,
  },
  middleSection: {
    flexDirection: 'row',
    height: SQUARE_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  squareFrame: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },

  // Frame corners
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF00',
    borderWidth: 3,
  },
  topLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // Instruction text
  instructionContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    opacity: 0.5,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // Info container at bottom
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dateTimeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  coordsText: {
    color: 'white',
    fontSize: 12,
  },

  // Preview styles
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  squarePreview: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    position: 'relative',
  },
  squarePreviewImage: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  previewInfoContainer: {
    alignItems: 'center',
  },
  previewDateTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  previewAddress: {
    color: 'white',
    fontSize: 12,
    marginBottom: 3,
    textAlign: 'center',
  },
  previewCoords: {
    color: 'white',
    fontSize: 10,
  },

  // Existing styles (camera controls)
  processingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  processingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cameraHeader: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 26,
    height: 26,
    tintColor: 'white',
  },
  iconImage1: {
    width: 15,
    height: 15,
    tintColor: 'white',
  },
  switchCameraButton: {
    position: 'absolute',
    right: 20,
  },
  captureButton: {
    width: 60,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: '20%',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: normalize(30),
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
