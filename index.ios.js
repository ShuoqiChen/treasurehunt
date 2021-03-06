var React = require('react-native');
var LoginScreen = require('./src/components/LoginScreen');
var HomePage = require('./src/components/HomePage');

var {
    Navigator,
    View
} = React;

var styles = React.StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  },
  container: {
    flex: 1, 
  }
});

console.disableYellowBox = true;

var treasurehunt = React.createClass ({
    getInitialState: function() {
        return {
            user: null,
            loggingIn: true,
        };
    },

    onLogin: function(user) {
        this.setState({
            user: user,
            loggingIn: false,
        })
    },

    onLogout: function() {
        this.setState({
            user: null,
            loggingIn: true,
        })
    },

    onSkipLogin: function() {
        this.setState({
            loggingIn: false,
        })
    },

    isLoggingIn: function() {
        return this.state.user == null && this.state.loggingIn
    },

    renderScene: function(route, navigator) {
        var Component = route.component;
        return (
            <View style={styles.container}>
                <Component
                    route={route}
                    navigator = {navigator}
                    topNavigator={navigator} />
            </View>
        )
    },

    render: function() {
        if (this.isLoggingIn()) {
            return (
                <LoginScreen onLogin={this.onLogin} onSkipLogin={this.onSkipLogin}/>
            );
        } 
        else {
            var rightButton = "Login"
            if (this.state.user != null)
                rightButton = "Logout"
                return (
                    <Navigator
                      sceneStyle={styles.container}
                      ref = {(navigator) => {this.navigator = navigator; }}
                      renderScene={this.renderScene}
                      barTintColor='#5da990'
                      titleTextColor='#FFFFFF'
                      navigationBarHidden={true}
                      initialRoute={{
                        title: 'TREASURE HUNT',
                        component: HomePage,
                        rightButtonTitle: rightButton,
                        onRightButtonPress: this.onLogout.bind,
                    }}/>
                );
        }
    },
});

React.AppRegistry.registerComponent('treasurehunt', function() { return treasurehunt });
