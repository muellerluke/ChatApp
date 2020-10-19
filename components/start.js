import React from 'react';
import { View, StyleSheet, TextInput, Button, ImageBackground, Text, TouchableOpacity } from 'react-native';
import background from "../assets/BackgroundImage.png";


export default class Start extends React.Component {
  constructor() {
    super(); 
    this.state = {
      name: "",
      color: "#ffffff",
    }
  }
  
  setActiveColor(color) {
    this.setState({color});
    console.log(this.state.color);
  }
  activeColor(color) {
    if (this.state.color === color) {
      return {
        borderColor: "#ffffff",
        borderWidth: "5px"
      }
    } else {
      return {
        borderWidth: "0px"
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={background} style={styles.image}>
          <Text style={styles.title}>Chat</Text>
          <View style={styles.bodyContainer}>
            <TextInput
             style={{height: "40px", borderColor: 'gray', borderWidth: 1, fontSize: 16, fontWeight: 300, fontColor: "#757083", marginBottom: "10%"}}
             onChangeText={(name) => this.setState({name})}
            value={this.state.name}
            placeholder='Your name'
            />
            <Text style={{fontSize: 16, fontWeight: 300, fontColor: "#757083"}}>Choose background color:</Text>
            <View style={styles.colorView}>
            <TouchableOpacity style={[styles.color1, styles.color, this.activeColor("#090C08")]} onPress={() => this.setActiveColor("#090C08")}>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.color2, styles.color, this.activeColor("#474056")]} onPress={() => this.setActiveColor("#474056")}>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.color3, styles.color, this.activeColor("#8A95A5")]} onPress={() => this.setActiveColor("#8A95A5")}>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.color4, styles.color, this.activeColor("#B9C6AE")]} onPress={() => this.setActiveColor("#B9C6AE")}>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.startChattingButton} onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })}>
              <Text style={styles.startChatting}>
                Start Chatting
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>  
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  image: {
    flex: 1,
    padding: "6%",
    alignItems: "bottom"
  },
  bodyContainer: {
    width: "100%",
    height: "44%",
    backgroundColor: "white",
    margin: "auto",
    padding: "6%",
    flexDirection: "col"
  },
  title: {
    flex: 1,
    fontSize: 45,
    fontWeight: 600,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: "20px"
  },
  colorView: {
    flexDirection: "row",
  },
  color: {
    width: "50px",
    height: "50px",
    borderRadius: "25px",
    marginRight: "10px"
  },
  color1: {
    backgroundColor: "#090C08"
  },
  color2: {
    backgroundColor: "#474056"
  },
  color3: {
    backgroundColor: "#8A95A5"
  },
  color4: {
    backgroundColor: "#B9C6AE"
  },
  startChattingButton: {
    backgroundColor: "#757083",
    height: "50px",
    textAlign: "center",
    position: "absolute",
    width: "88%",
    bottom: "6%",
  },
  startChatting: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "auto",
    paddingTop: "0px"
  }
});