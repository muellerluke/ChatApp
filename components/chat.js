import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { color } from "react-native-reanimated";
const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      color: "#fff",
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      uid: 0,
      loggedInText: ""
    }

    const firebaseConfig = {
      apiKey: "AIzaSyAwwXNvHOpqLK78_DIL8VEhJXTzP1M3wEs",
      authDomain: "test-3c75d.firebaseapp.com",
      databaseURL: "https://test-3c75d.firebaseio.com",
      projectId: "test-3c75d",
      storageBucket: "test-3c75d.appspot.com",
      messagingSenderId: "143609071198",
      appId: "1:143609071198:web:54489eefb4393dcc4cd6cf",
      measurementId: "G-7K3F9BKD1D"
    };

    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceMessages = firebase.firestore().collection("messages");
  }

  componentDidMount() {
    //get name and color from previous component
    let { name } = this.props.route.params;
    let { color } = this.props.route.params;
    this.setState({color});
    //set the title of the component (as shown on the top of the screen) as the name
    this.props.navigation.setOptions({ title: name });
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          await firebase.auth().signInAnonymously();
          console.log(user);
        } catch (error) {
          console.log(error);
        }
        
      }
      this.setState({
        uid: user.uid,
        loggedInText: "Hello there"
      });
    });
    this.unsubscribe = this.referenceMessages.onSnapshot(this.onCollectionUpdate)}
  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        }
      });
    });
    this.setState({
      messages,
    });
  };
  addMessages() {
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text,
      createdAt: this.state.messages[0].createdAt,
      user: this.state.messages[0].user,
      uid: this.state.uid
    });
  }
  // when message is sent append it to array in previous state
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessages();
    }
    );
  }
  // apply styling to message bubble component
  renderBubble(props) {
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

  render() {
    return (
      <View style={{backgroundColor: this.state.color, flex: 1}}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
          _id: 1,
          }}
        />
        {/* move input field with keyboard on android*/}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    )
  }
}