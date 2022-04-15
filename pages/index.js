// @generated: @expo/next-adapter@2.1.52
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, LogBox, Dimensions, ScrollView, ActivityIndicator, Button, Image, Share, StatusBar, Platform, TextInput } from 'react-native';
import { Dialog, Input, Divider, ListItem } from 'react-native-elements'
import { styles } from '../styles/Globals';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { translations } from '../translations';
import i18n from 'i18n-js';
import * as Localization from 'expo-localization';
import { app } from '../firebase.config';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, query, where, getDocs, getDoc, addDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, uploadString } from "firebase/storage";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';




i18n.translations = translations
i18n.locale = Localization.locale;
i18n.fallbacks = true;
LogBox.ignoreLogs(['Warning: Async Storage has been extracted from react-native core']);
LogBox.ignoreLogs(['Warning: AsyncStorage has been extracted from react-native core and will be removed in a future release']);
LogBox.ignoreLogs(['Setting a timer for a long period of time']);
LogBox.ignoreLogs(["AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage"]);

function randomBetween(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}


export default function App() {
  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)
  const [score, setScore] = React.useState(0)
  const [userId, setUserId] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [userHighScore, setUserHighScore] = React.useState(0)
  const [userPosition, setUserPosition] = React.useState(0)
  const [isUserInDB, setIsUserInDB] = React.useState("")
  const [scores, setScores] = React.useState([])
  const [scoreboardVisible, setScoreboardVisible] = React.useState(false)
  const [lostVisible, setLostVisible] = React.useState(false)
  const [alertAdVisible, setAlertAdVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ left: 100, top: 100 })
  const [size, setSize] = React.useState(250)
  const windowWidth = Dimensions.get('window').width - size - 100;
  const windowHeight = Dimensions.get('window').height - size - 100;
  const [image, setImage] = React.useState(null)
  const [uploading, setUploading] = React.useState(false)
  const [remoteURL, setRemoteURL] = React.useState("https://firebasestorage.googleapis.com/v0/b/inutil-2dx1.appspot.com/o/placeholder.png?alt=media");
  const [isWorldRecord, setIsWorldRecord] = React.useState(false)
  const [heighestScore, setHighestScore] = React.useState(0)


  //Anonymoyus Authentication with Firebase
  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth)
          .then(() => {
            // Signed in..
            setUserId(user.uid)
            console.log("signed in")
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage)
            // ...
          });
      }
      else {
        setUserId(user.uid)
      }
    })
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (score) {
        setSize(size - 1)
      }
    }, 1000 * 60);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      getDownloadURL(ref(storage, "inutil/object.jpg")).then(url => {
        setRemoteURL(url)
      })
    }, 1000);
  }, []);

  React.useEffect(async () => {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }
  }, [])


  //Get all scores from Database
  React.useEffect(async () => {
    await getScores()
    getUserHighScore()
  }, [userId])

  const getScores = async () => {
    const querySnapshot = await getDocs(query(collection(db, "scores")))
    const scoruri = []
    querySnapshot.forEach((doc) => {
      scoruri.push(doc.data())
    })
    setScores(scoruri)
    scoruri.map(item => {
      if (item.userId == userId) {
        setUserHighScore(item.score)
      }
    })
  }

  const getUserHighScore = async () => {
    const queryRef = query(collection(db, "scores"), where("userId", "==", userId))
    const querySnapshot = await getDocs(queryRef)
    querySnapshot.forEach((doc) => {
      const item = doc.data()
      console.log(item)
      setUserHighScore(item.score)
      setUsername(item.username)
      setIsUserInDB(doc.id)
    })
  }
  const showLost = async () => {
    getHighestScore().then(() => {
      setLostVisible(!lostVisible)
      setIsWorldRecord(true)
      return
    })
    setLostVisible(!lostVisible)
  }

  const getHighestScore = async () => {
    await getScores()
    //gaseste maximul din scoruri
    const max = Math.max(...scores.map(item => item.score))
    setHighestScore(max)
    return max
  }



  const showScoreboard = async () => {
    await getScores()
    setScoreboardVisible(!scoreboardVisible)
  }

  const objectTouch = () => {
    let left = randomBetween(0, windowWidth)
    let top = randomBetween(0, windowHeight)
    setPosition({ left: left, top: top })
    setScore(score + 1)
  }

  const spaceTouch = async () => {
    showLost()
  }

  const reset = async () => {
    if (score > userHighScore) {
      setUserHighScore(score)
      if (!isUserInDB) {
        const queryRef = query(collection(db, "scores"))
        await addDoc(queryRef, {
          score: score,
          userId: userId,
          username: username
        })
      }
      else {
        const queryRef = doc(db, 'scores', isUserInDB)
        await updateDoc(queryRef, {
          score: score,
          userId: userId,
          username: username
        })
      }
    }
    setScore(0)
    showLost()
  }

  const changeUsername = (text) => {
    // console.log(text)
    setUsername(text)
  }

  const pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
    });

    // console.log({ pickerResult });

    handleImagePicked(pickerResult);
  }

  const handleImagePicked = async (pickerResult) => {
    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        const uploadUrl = await callAD(pickerResult.uri);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  const uploadImageAsync = async (uri) => {
    const downloadLink = {}
    const file = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    // console.log(file)

    const imgName = "inutil/object.jpg";
    // Create file metadata including the content type
    const metadata = {
      contentType: "image/jpeg",
    };

    const storageRef = ref(storage, imgName)
    uploadBytes(storageRef, file, metadata).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        // console.log('File available at', downloadURL);
        setRemoteURL(downloadURL)
        downloadLink.url = downloadURL
      });
    })

    // // We're done with the blob, close and release it
    file.close();
    return true
  }

  const callAD = async (uri) => {
    const rewardAdUnitID = Platform.select({
      // AdMob
      //https://developers.google.com/admob/ios/test-ads
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXX', 
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXXXXXXXX'
    });

    AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', () => {
      console.log("FAIL TO LOAD")
      uploadImageAsync(uri).then(() => {
        setAlertAdVisible(false)
      })
    });
    AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
      console.log("EARN REWARD")
      uploadImageAsync(uri).then(() => {
        setAlertAdVisible(false)
      })
    });

    AdMobRewarded.addEventListener('rewardedVideoDidFailToPresent', () => {
      console.log("FAIL TO LOAD")
      uploadImageAsync(uri).then(() => {
        setAlertAdVisible(false)
      })
    });
    AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
      setUploading(false)
    });

    AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {
      //generate()
    });

    await setTestDeviceIDAsync('TESTDEVICE');
    await AdMobRewarded.setAdUnitID(rewardAdUnitID);
    await AdMobRewarded.requestAdAsync();
    await AdMobRewarded.showAdAsync();

  }

  const changeAlertAdVisible = () => {
    setAlertAdVisible(!alertAdVisible)
  }



  const maybeRenderImage = () => {
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden",
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
        {image}
      </View>
    );
  };

  const ScoresList = () => {
    let listItems = []
    let sortedItems = []
    //sort by score descending
    listItems = scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
    console.log(listItems)

    let allScoresSort = new Object([...scores.entries()].slice().sort((a, b) => b[0] - a[0]))
    Object.entries(listItems).forEach((item, key) => {
      if (item[1].userId == userId) {
        setUserPosition(key + 1)
      }
      sortedItems.push(
        <ListItem key={key} bottomDivider>
          <ListItem.Content>
            <ListItem.Title></ListItem.Title>
            <Text>{key + 1}. {item[1].username} {item[1].score}</Text>
          </ListItem.Content>
        </ListItem>
      )
    })
    // console.log(allScoresSort)
    return sortedItems
  }

  //Create and manipulate the object
  const ObjectX = () => {
    return (
      <TouchableHighlight onPress={objectTouch} style={{ width: size, height: size, backgroundColor: "#000", position: 'absolute', left: position.left, top: position.top }}>
        <Image source={{ uri: remoteURL }} style={{ width: size, height: size }} />
        {/* <Text>Ceva</Text> */}
      </TouchableHighlight>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={[{ flexDirection: 'row' }, styles.header]}>
          <Text style={styles.text}>{i18n.t('high')}: {userHighScore}</Text>
          <Divider orientation="vertical" />
          <Text style={styles.text}>{i18n.t('score')}: {score}</Text>
          <Divider orientation="vertical" />
          <TouchableHighlight onPress={showScoreboard}>
            <Text style={styles.text}>🌎</Text>
          </TouchableHighlight>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.text}>{i18n.t('title')}</Text>
          <TouchableHighlight onPress={changeAlertAdVisible}>
            <Text style={styles.text}>🔄</Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight onPress={spaceTouch} style={{ width: "100%", height: "100%" }}>
          <ObjectX />
        </TouchableHighlight>

        <Dialog
          isVisible={scoreboardVisible}
          onBackdropPress={showScoreboard}
        >
          <Dialog.Title title="Worldwide Scores" />
          <Text>Your position: {userPosition}</Text>
          <ScrollView style={{ paddingVertical: 10 }}>
            <ScoresList />
          </ScrollView>
        </Dialog>

        <Dialog
          isVisible={lostVisible}
        // onBackdropPress={reset}
        >
          <Dialog.Title titleStyle={{ fontSize: 30 }} title="You Lost!" />
          {isWorldRecord && <Text style={[styles.textInverse, {fontSize:40, fontWeight:'bold'}]}>🏅 New World Record!</Text>}
          <Text style={styles.textInverse}>Save your score</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, fontSize: 24, marginTop: 10 }}
            value={username}
            onChangeText={(text) => changeUsername(text)}
            autoFocus
            placeholder='Enter your name'
          />
          <Dialog.Actions>
            <Dialog.Button
              title="Play again"
              onPress={reset}
              titleStyle={{ fontSize: 24 }}
            />
          </Dialog.Actions>
        </Dialog>

        <Dialog
          isVisible={alertAdVisible}
          onBackdropPress={changeAlertAdVisible}
        >
          <Dialog.Title titleStyle={{ fontSize: 30 }} title="Change the picture" />
          <Text style={styles.textInverse}>For you to change the picture, you will have to watch an add</Text>
          {uploading ?
            <View style={[{ flexDirection: 'row', alignContent: 'center', alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }, styles.textInverse]}>
              <Text>Uploading image...</Text>
              <Dialog.Loading />
            </View>
            :
            <Dialog.Actions>
              <Dialog.Button
                title="Select image"
                onPress={pickImage}
                titleStyle={{ fontSize: 24 }}
              />
            </Dialog.Actions>
          }
        </Dialog>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}


