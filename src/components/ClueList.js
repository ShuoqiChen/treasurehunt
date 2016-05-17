var React = require('react-native');
var ClueDisplay = require('./ClueDisplay');

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
    lockedDescription: {
    	textAlign: 'center',
    	fontSize: 25,
    	paddingTop: 10
    },
    rowContainer: {
	    flexDirection: 'row',
	    padding: 10,
	    height: 75,
	    justifyContent: 'center'
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
	    borderColor:'#000000', 
    }
});

const Firebase = require('firebase')
const config = require('../../config')
const cluesRef = new Firebase(`${ config.FIREBASE_ROOT }/clues`)
const userSolutionsRef = new Firebase(`${ config.FIREBASE_ROOT }/user_solutions`)

var ClueList = React.createClass({
	getInitialState: function() {
        var dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1.guid != r2.guid,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        });
        
        return {
            dataSource: dataSource
        };
    },

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

    populateArray: function(solutionsForThisHunt) {

        var cluesArray = this.props.hunt.clues;
        var clues = [];
        var solutionsToClues = [];
        var userCompletedClues = [];
        var inProgress;

        // specify which of user's clues are in progress versus completed
        for (var i = 0; i < solutionsForThisHunt.length; i++ ) {
            if (solutionsForThisHunt[i].completed == 0) {
                inProgress = solutionsForThisHunt[i].clue_id;
            }
            else {
                userCompletedClues.push(solutionsForThisHunt[i].clue_id);
            }
        }

        //for all clues in clueArray
        for (var j = 0; j < cluesArray.length; j++) {
            var clueRef = cluesRef.child(cluesArray[j]);
            clueRef.on('value', (snap) => {

                // if a clue is in progress, add to appropriate category
                if (snap.val().id == inProgress) {
                    clues.push({
                        title:snap.val().title,
                        description: snap.val().description,
                        category: "inProgress", 
                        clueId: snap.val().id
                    });
                }

                // completed clue
                else if (userCompletedClues.indexOf(snap.val().id) > -1) {
                    clues.push({
                        title:snap.val().title,
                        description: snap.val().description,
                        category: "complete", 
                        clueId: snap.val().id
                    });
                }

                //incomplete clue
                else {
                    clues.push({
                        title:snap.val().title,
                        description: snap.val().description, 
                        category: "incomplete",
                        clueId: snap.val().id
                    });
                }
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRowsAndSections(this.convertCluesArrayToMap(clues))
                });
            });
        }
    },  

    listenForItems: function(cluesRef) {
        //TODO: fix logic coming from completed clue
        var userCompletedClues = [0, 1, 2, 5];
        
        //todo start at end at not working
        //get all clues for user in hunt, add them to array
        var huntID = this.props.hunt.id;

        var solutionsForThisHunt = [];
        //TODO: don't hardcode hunt 
        userSolutionsRef.orderByChild('user_id').startAt(0).endAt(0).once('value', (snap) => {
            var solution = snap.val();
            for (var i = 0; i < solution.length; i++) {
                if (solution[i].hunt_id == 0) {
                    solutionsForThisHunt.push(solution[i]);
                }
            }
            this.populateArray(solutionsForThisHunt);
        });

    },

    componentDidMount: function() {
        this.listenForItems(cluesRef);
    },

    rowPressed: function(clueId) {
        //TODO: if clue is completed, load solution. 
        //if clue is in progress, load current progress
        this.props.navigator.push({
            title: "Hunt",
            component: ClueDisplay,
            passProps: {
                hunt: this.props.hunt,
                clueId: clueId
            }
        });
    },

    renderRow: function(rowData, sectionID, rowID) {
    	if (rowData.category === "complete") {
	      	return (
	      		<TouchableHighlight onPress={() => this.rowPressed(rowData.clueId)}
                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <View style={styles.completeTextContainer}>
                            <Text style={styles.title}>{rowData.title}</Text>
                            <Text style={styles.statusDescription}
                                >- COMPLETED -</Text>
                        </View> 
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
	      	);
    	} 
        else if (rowData.category === "inProgress") {
            return (
                <TouchableHighlight onPress={() => this.rowPressed(rowData.clueId)}
                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <View style={styles.completeTextContainer}>
                            <Text style={styles.title}>{rowData.title}</Text>
                            <Text style={styles.statusDescription}
                                >- IN PROGRESS -</Text>
                        </View> 
                    </View>
                    <View style={styles.separator}/>
                </View>
            </TouchableHighlight>
            );
        } 
        else {
	      	return (
            <TouchableHighlight
                underlayColor='#dddddd'>
                <View>
                    <View style={styles.rowContainer}>
                        <View style={styles.incompleteTextContainer}>
                            <Text style={styles.lockedDescription}
                                >- LOCKED -</Text>
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
					<Text style={styles.huntTitle}>CLUES LIST</Text>
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

module.exports = ClueList;
