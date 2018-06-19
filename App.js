import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  AsyncStorage,
  Image,
  Picker,
  FlatList,
  TextInput,
  ImageBackground
} from 'react-native';
import { stringify } from 'querystring';
import { LinearGradient } from 'expo';

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      map: 'placeholder',
      latitude: "0",
      longitude: "0",
      rate: "0",
      initializing: "true",
      fromCountryCurrencyName:'',
      fromCountryCurrency: '',
      fromCountryName: '',
      fromCountryCode: '',
      fromValue: "✨ Loading! ✨",
      fromSymbol: '',
      toCountryCurrencyName: 'United States dollar',
      toCountryName: 'United States',
      toCountryCode: 'US',
      toCountryCurrency: 'USD',
      toSymbol:"$",
      toValue: "1",
      located: "false",
      display: 'hi'
    }
  }
  componentDidMount(){
  };

  getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  loadPosition = async () => {
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      this.setState({
        latitude: latitude,
        longitude: longitude
      });

      this.createMap()
      this.coordToCountry()
    } catch (error) {
      console.log(error);
    }
  };

  componentWillMount(){
    this.loadPosition()
    // this.findLocation()
    if (!AsyncStorage.getItem('toCountry')) {
      this.toCountryCurrency = 'USD'
    } else {
      this.toCountryCurrency = AsyncStorage.getItem('toCountry')
    }
  };

  createMap() {
    let that = this
    let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + that.state.latitude + "," + that.state.longitude + "&result_type=country&key=AIzaSyAc9BvmSaga2NJwzDn7iSn_Oz6I7Th3oIE"
    // let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=37.4224764,-122.0842499&result_type=country&key=AIzaSyAc9BvmSaga2NJwzDn7iSn_Oz6I7Th3oIE"

    fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
      that.setState({
        fromCountryName: data.results[0].address_components[0].long_name,
        fromCountryCode: data.results[0].address_components[0].short_name
      })
    })
  };

  countryFromCountryCode() {
    let that = this
    // that.setState({
    //   fromCountryCurrency: 'IDN',
    //   fromCountryCurrencyName: 'Indonesian rupiah'
    // })
    // that.countryToRate()
    let countries = "https://www.currencyconverterapi.com/api/v5/countries?apiKey=d996c6d6-ec4a-46d0-ad17-f9eba3092eb9"
    
    fetch(countries)
    .then((resp) => resp.json())
    .then(function (data) {
      that.setState({
        fromCountryCurrency: data.results[that.state.fromCountryCode].currencyId,
        fromCountryCurrencyName: data.results[that.state.fromCountryCode].currencyName,
        fromSymbol: data.results[that.state.fromCountryCode].currencySymbol,
      })
        that.countryToRate()
      })
  };

  coordToCountry() {
    this.setState({
      map: "https://maps.googleapis.com/maps/api/staticmap?center=" + this.state.latitude + "," + this.state.longitude + "&zoom=13&size=400x500&sensor=false&key=AIzaSyAc9BvmSaga2NJwzDn7iSn_Oz6I7Th3oIE"
    })
    this.countryFromCountryCode()
  };

  countryToRate(...args) {
    let that = this
    let from = that.state.fromCountryCurrency
    let to = that.state.toCountryCurrency
    let convert = "https://www.currencyconverterapi.com/api/v5/convert?q=" + to + "_" + from + "&compact=ultra&apiKey=d996c6d6-ec4a-46d0-ad17-f9eba3092eb9"
    // let convert = "https://www.currencyconverterapi.com/api/v5/convert?q=USD_THB&compact=ultra&apiKey=d996c6d6-ec4a-46d0-ad17-f9eba3092eb9"
    // console.log(convert)

    // that.setState({
    //   rate: 14155.70
    // })
    // that.popFromValue()

    fetch(convert)
      .then((resp) => resp.json())
      .then(function (data) {
        that.setState({
          rate: data[to + "_" + from]
        })
        // console.log("loaded rate " + that.rate)
        // that.fromValue = that.rate
        that.popFromValue()
      })

  };
  popFromValue() {
    let newValue = this.state.toValue * this.state.rate
    let toValue = 1
    this.setState({
      fromValue: newValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      toValue: toValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
  };
  fromMath(x) {
    let newValue = x / this.state.rate
    this.setState({
      toValue: newValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      fromValue: x.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
  };

  // toMath(x) {
  //   let newValue = x.value
  //   this.setState({
  //     toValue: newValue
  //   })
  // };

  // <Image style={{margin:50,height:80,width:80}} source={require("./logo.png")}/>>
  render() {
    return (
      <View style={styles.container} >

        <Image
          id="map"
          style={{ 
            backgroundColor: '#ccc',
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: 250,
            justifyContent: 'center',
          }}
          source={{ uri: this.state.map }}
          blurRadius={2}
        />
        
        
        <LinearGradient 
        colors = {['rgba(121, 131, 254, .8))', 'rgba(255, 10, 254, 0.2)']}
        style={styles.sentence}
        >

          <Text style={styles.bold}>
            { this.state.fromValue} {"\n"}
            <Text style={styles.subtext}>
              {this.state.fromSymbol + " " + this.state.fromCountryCurrencyName} equals
            </Text>
          </Text>

          <Text style={styles.bold}>
            {this.state.toValue}{"\n"}
            <Text style={styles.subtext}>
              {this.state.toSymbol + " " + this.state.toCountryCurrencyName}
            </Text>
          </Text>

          <Text style={styles.pin}> 🗺 {this.state.fromCountryName}</Text>
        </LinearGradient>

        <View style={styles.inputContainer}>
          <View style={styles.inputs}>
            <Text style={{fontSize: 22 }}></Text>
            <TextInput
              keyboardType='numeric'
              returnKeyType = 'go'
              style={styles.currencyOutput}
              onChangeText={(fromValue) => this.fromMath(fromValue)}
              value={this.state.fromValue}
              selectTextOnFocus
            />
            <Text style={styles.countryCurrency}>{this.state.fromCountryCurrency}</Text>
          </View>

          <View style={styles.inputs}>
            <Text style={{ fontSize: 22 }}></Text>
            <TextInput
              keyboardType='numeric'
              style={styles.currencyOutput}
              onChangeText={(toValue) => this.setState({ toValue })}
              value={this.state.toValue}
              selectTextOnFocus
              editable="false"
            />
            <Text style={styles.countryCurrency}>{this.state.toCountryCurrency}</Text>
            </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subtext:{
    fontWeight: 'normal', 
    fontSize: 22, 
    color: 'rgba(255,255,255,0.8)',
  },
  bold:{
    fontWeight: 'bold',
    fontSize: 42,
    // color: '#7983FE',
    color: 'white',
    padding:10
  },
  sentence:{
    height:250,
    paddingTop:30,
    width:'100%',
    padding:15,
    // backgroundColor:'rgba(255,255,255,0.5)'
  },
  container: {
    // flex: 1,
    backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'space-around',
  },
  pin:{
    position:'absolute',
    bottom:0,
    textAlign: 'center',
    opacity:0.5,
    padding:5,
    width:'100%',
    color:'white',
    display:'none'
  },
  inputContainer:{
    position:'absolute',
    top:290,
    width:'100%'
  },
  countryCurrency:{
    // margin:20,
    width:'20%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color:'grey',
    padding: 10
  },
  inputs:{
    padding:10,
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
  },
  currencyOutput: {
    flex:1,
    fontSize:18,
    padding: 10, 
    borderColor: 'rgba(121, 131, 254, .5)',
    // borderColor: 'lightgrey',
    borderWidth: 1,
    backgroundColor:'white',
    borderRadius:5
  }
});

// appleStocks(){
//   async function geolocateMe() {
//     let url = 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol=AAPL';
//     let response = await fetch(url);
//     let body = await response.json();
//     let {
//       AlertIOS
//     } = require('react-native');
//     AlertIOS.alert(body.Symbol, '$' + body.LastPrice);
//   }
// };