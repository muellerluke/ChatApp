import React from 'react';
import { View, Text} from 'react-native';


export default class Chat extends React.Component {
  render() {
    //let name = this.props.route.params.name; // OR ...
    let { name } = this.props.route.params;
    let { color } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });

    return (
      <View style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: color}}>
        <Text>Hello Screen2!</Text>
      </View>
    )
  }
}