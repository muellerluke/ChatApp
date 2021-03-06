import React, { Component } from 'react';
import {
  View, Platform, KeyboardAvoidingView, YellowBox,
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

const firebase = require('firebase');
require('firebase/firestore');

YellowBox.ignoreWarnings(['Warning: ...']);

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      color: '#fff',
      user:{
        _id: '',
        name: '',
        avatar: '',
      },
      uid: 0,
      loggedInText: '',
      isConnected: false,
      image: null,
      location: null
    }

    const firebaseConfig = {
      apiKey: 'AIzaSyAwwXNvHOpqLK78_DIL8VEhJXTzP1M3wEs',
      authDomain: 'test-3c75d.firebaseapp.com',
      databaseURL: 'https://test-3c75d.firebaseio.com',
      projectId: 'test-3c75d',
      storageBucket: 'test-3c75d.appspot.com',
      messagingSenderId: '143609071198',
      appId: '1:143609071198:web:54489eefb4393dcc4cd6cf',
      measurementId: 'G-7K3F9BKD1D'
    };

    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceMessages = firebase.firestore().collection('messages');
  }

  componentDidMount() {
    //get name and color from previous component
    let { name } = this.props.route.params;
    let { color } = this.props.route.params;
    this.setState({color});
    //set the title of the component (as shown on the top of the screen) as the name
    this.props.navigation.setOptions({ title:`${name}'s Chat` });
    //get network info; if connected then get messages from db else get from interal storage
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
        this.setState({isConnected: true});
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (aUser) => {
          if (!aUser) {
            try {
              await firebase.auth().signInAnonymously();
              console.log(aUser);
            } catch (error) {
              console.log(error);
            }
            
          }
          this.setState({
            user: {
              _id: aUser.uid,
            },
            uid: aUser.uid,
            loggedInText: 'Hello there',

          });
        });
        this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
      } else {
        this.setState({isConnected: false});
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  /**
   * loads all messages from AsyncStorage
   * @async
   * @function getMessages
   * @param {string} messages
   * @return {state} messages
   */
  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * Deletes messages from AsyncStorage
   * @async
   * @function deleteMessages
   * @param {string} messages
   * @return {AsyncStorage}
   */
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Saves messages to AsyncStorage
   * @async
   * @function saveMessages
   * @param {string} messages
   * @return {AsyncStorage}
   */
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Update message state with recent data
   * @function onCollectionUpdate
   * @param {string} _id - message id
   * @param {string} text - content
   * @param {date} cratedAt - date and time sent
   * @param {string} user - user data
   * @param {string} image - image sent
   * @param {number} location - geographical coordinates
   */
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        },
        image: data.image || '',
        location: data.location || '',
      });
    });
    this.setState({
      messages,
    });
  };

  /**
   * Pushes messages to Firestore database
   * @function addMessages
   * @param {string} _id - message id
   * @param {string} text - message content
   * @param {date} cratedAt - date and time of message
   * @param {string} image
   * @param {number} location - geographical coordinates
   * @param {boolean} sent
   */
  addMessages = () => {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text,
      createdAt: this.state.messages[0].createdAt,
      user: this.state.messages[0].user,
      uid: this.state.uid,
      image: this.state.messages[0].image || '',
      location: this.state.messages[0].location || '',
    });
  }

  /**
   * Sends messages
   * @async
   * @function onSend
   * @param {string} messages
   * @return {state} GiftedChat
   */
  onSend = (messages = []) => {
    console.log(messages);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessages();
      this.saveMessages();
    }
    );
  }

  // apply styling to message bubble component
  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  /**
   * Renders input toolbar only if online
   * @function renderInputToolbar
   * @param {*} props
   * @returns {InputToolbar}
   */
  renderInputToolbar = (props) => {
    if (!this.state.isConnected) {
    } else {
      return <InputToolbar {...props} />;
    }
  };

  /**
   * if currentMessage has location coords then mapview is returned
   * @function renderMapView
   * @param {*} props
   * @returns {MapView}
   */
  renderMapView = props => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View>
          <MapView
            style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
          />
        </View>
      );
    }
    return null;
  }

  /**
   * Renders upload image, take photo and share location options
   * @function renderCustomActions
   * @param {*} props
   * @returns {CustomActions}
   */
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  }

  render() {
    return (
      <View style={{backgroundColor: this.state.color, flex: 1}}>
        {this.state.image && (
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        )}
        <GiftedChat
          renderCustomView={this.renderMapView}
          renderActions={this.renderCustomActions}
          renderInputToolbar={this.renderInputToolbar}
          renderBubble={this.renderBubble}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          image={this.state.image}
          user={{
            _id: this.state.uid
          }}
        />
        { /* move input field with keyboard on android */ }
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null}
      </View>
    );
  }
}
