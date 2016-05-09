var React = require('react-native');

var {
	StyleSheet,
	Image,
	View,
	Text,
	Component,
	TouchableHighlight,
	ListView
} = React;

var styles = StyleSheet.create({
	container: {
		marginTop: 65,
		paddingRight:30,
		paddingLeft: 30, 
		flex: 1
	},
	separatorSmall: {
		height: 16
	},
	separatorLarge: {
		height: 26
	},
	huntTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		margin: 5,
		color: '#656565',
		alignSelf: 'center'
	},
	separator: {
        height: 1,
        backgroundColor: '#dddddd'
    },
    title: {
        fontSize: 20,
        color: '#656565',
        alignSelf: 'center'
    }, 
    description: {
        paddingTop: 3,
        paddingBottom: 8,
        alignSelf: 'center'
    },
    statusDescription: {
    	paddingTop: 5,
    	paddingBottom: 8,
    	alignSelf: 'center',
    },
    rowContainer: {
	    flexDirection: 'row',
	    padding: 10,
	    height: 75,
	    // alignItems: 'center'
  	},
    completeTextContainer: {
    	flex: 1,
	    borderWidth: 2,
	    borderColor:'#000000', 
	},
    incompleteTextContainer: {
	    flex: 1,
	    backgroundColor: '#dddddd',
	    borderWidth: 2,
	    borderColor:'#000000'
    }
});

const Firebase = require('firebase')
const config = require('../../config')
const cluesRef = new Firebase(`${ config.FIREBASE_ROOT }/clues`)

var Hunt = React.createClass({
	getInitialState: function() {
        var dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1.guid != r2.guid,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });
        
        return {
            dataSource: dataSource
        };
    },
    //TODO: add categories,
    convertCluesArrayToMap: function(clues) {
        var cluesCategoryMap = {};

        for (var i =0; i < clues.length; i++ ) {
            if (!cluesCategoryMap[clues[i].category]) {
                cluesCategoryMap[clues[i].category] = [];
            }
            cluesCategoryMap[clues[i].category].push(clues[i]);
        }
        return cluesCategoryMap;
    },

    listenForItems: function(cluesRef) {
        var userCompletedClues = [0,1];
        var cluesArray = this.props.hunt.clues;

        var clues = [];
        for (var key in cluesArray) {
        	var clueRef = cluesRef.child(key);
        	clueRef.on('value', (snap) => {
        		if (snap.val() in userCompletedClues) {
	        		clues.push({
	        			title:snap.val().title,
	        			description: snap.val().description,
	        			category: "complete"
	        		});
	        	}
        		else {
        			clues.push({
	        			title:snap.val().title,
	        			description: snap.val().description, 
	        			category: "incomplete"
        			});
        		}
        		this.setState({
            		dataSource: this.state.dataSource.cloneWithRowsAndSections(this.convertCluesArrayToMap(clues))
            	});
        	});
        }
    },

    componentDidMount: function() {
        this.listenForItems(cluesRef);
    },

    rowPressed: function() {
        console.log('row pressed');
    },

    renderRow: function(rowData, sectionID, rowID) {
    	if (rowData.category === "complete") {
	      	return (
	      		<TouchableHighlight onPress={() => this.rowPressed}
                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <View style={styles.completeTextContainer}>
                            <Text style={styles.title}>{rowData.title}</Text>
                            <Text style={styles.statusDescription}
                                >COMPLETED</Text>
                        </View> 
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
	      	);
    	} else {
	      	return (
            <TouchableHighlight onPress={() => this.rowPressed}
                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <View style={styles.incompleteTextContainer}>
                            <Text style={styles.statusDescription}
                                >LOCKED</Text>
                        </View> 
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
        	);
    	}
	},

	// unneccessary unless we want different sections
    // renderSectionHeader(sectionData, category) {
    //     return (
    //         <View style={styles.header}>
    //             <Text style={styles.headerText}>{category}</Text>
    //         </View>
    //     );
    // }

	render: function() {
		var hunt = this.props.hunt;
		var huntRef = new Firebase(`${ config.FIREBASE_ROOT }/hunts`);
		return (
			<View style={styles.container}>
				<View>
					<Text style={styles.huntTitle}>{hunt.title.toUpperCase()}</Text>
				</View>
				<View style={styles.separatorSmall}/>
				<ListView
                    dataSource={this.state.dataSource}
                    automaticallyAdjustContentInsets={false}
                    renderRow={this.renderRow}/>
			</View>
		);
	},
});

module.exports = Hunt;

