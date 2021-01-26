import * as React from 'react';
import {ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Card, IconButton, Title} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import GestureRecognizer from 'react-native-swipe-gestures';
import * as SQLite from 'expo-sqlite';
import Modal from "react-native-modal";

const db = SQLite.openDatabase("db.db");

export default class Marks extends React.Component {

    constructor(props) {
        console.log("------------------------------CALENDAR------------------------------")
        super(props);
        this.state = {
            loading: false,
            monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            monthNamesShort: ['Janv.', 'Févr.', 'Mars ', 'Avril', 'Mai  ', 'Juin ', 'Juil. ', 'Août ', 'Sept.', 'Oct. ', 'Nov. ', 'Déc. '],
            dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
            today: 'Aujourd\'hui',
            startHours: {
                "8": "8h10",
                "9": "9h10",
                "10": "10h20",
                "11": "11h20",
                "12": "12h20",
                "13": "13h15",
                "14": "14h10",
                "15": "15h20",
                "16": "16h20",
                "17": "17h20",
                "18": "18h20",
            },
            endHours: {
                "8": "8h05",
                "9": "9h05",
                "10": "10h05",
                "11": "11h15",
                "12": "12h15",
                "13": "13h15",
                "14": "14h10",
                "15": "15h05",
                "16": "16h15",
                "17": "17h15",
                "18": "18h15",
                "19": "19h00",
            },
            currentDate: this.getTrueDate(new Date()),
            selectedDate: new Date(),
            mode: 'date',
            show: false,
            data: {},
            datav2: {},
            isConnected: false
        }

    }

    onChange = (event, selectedDate) => {
        if (selectedDate) {
            db.transaction(tx => {
                tx.executeSql("SELECT * FROM timetables WHERE _date = ?", [this.getTrueDate(selectedDate)], (_, rows) => {
                        let data = {}
                        let datav2 = {}
                        data = rows.rows._array
                        data.map((v) => {
                            datav2[new Date(v._from).getHours()] = v
                        })
                        this.setState({
                            show: Platform.OS === 'ios',
                            data: data,
                            datav2: datav2,
                            selectedDate: selectedDate || this.state.selectedDate,
                            loading: true
                        })
                    }, () => {
                        console.log("error")
                    }
                )
            })
        }
    }

    showMode = (crrMd) => {
        this.setState({show: true, mode: crrMd})
    }

    showDatepicker = () => {
        this.showMode('date')
    }

    getTrueDate(date) {
        return date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1 < 10 ? "0" + (parseInt(date.getMonth()) + 1).toString() : (parseInt(date.getMonth()) + 1).toString()) + '-' + (parseInt(date.getDate()) < 10 ? "0" + date.getDate() : date.getDate())
    }

    componentDidMount() {
        console.log("-----------------------MOUNT Home-------------------------")
        this.onChange("", this.state.selectedDate)
    }

    render() {
        const renderItemV2 = (item) => {
            let testv1 = 0;
            let Memory = true;
            let Memo = false;
            return (
                <View>
                    {
                        Object.keys(this.state.startHours).map((v, idx) => {

                            if (Memory) {

                                let hoursLen = Object.keys(this.state.startHours).length - 1;
                                let test = item.filter(p => new Date(p._from).getHours() <= v && new Date(p._to).getHours() > v);

                                if (this.state.datav2.hasOwnProperty(v)) {
                                    testv1 = new Date(this.state.datav2[v]._to).getHours() - new Date(this.state.datav2[v]._from).getHours()
                                    if (testv1 >= 2) {
                                        Memory = false
                                    }
                                } else {
                                    testv1 = 1
                                }

                                return (
                                    <View
                                        key={v + idx.toString()}
                                        style={[styles.cardContainer, {
                                            marginBottom: idx === hoursLen ? 10 : 4,
                                            marginTop: idx === 0 ? 20 : 0,
                                        }]}
                                    >
                                        <Card
                                            style={[styles.cardMain, {minHeight: testv1 > 1 ? 110 : 70}]}
                                        >
                                            <Card.Content
                                                style={[styles.fl1, styles.spBtw]}
                                            >
                                                <View>
                                                    <Text
                                                        style={[styles.f18, styles.leSp]}>{this.state.startHours[v]}</Text>
                                                </View>
                                                <View>
                                                    <Text style={{
                                                        fontSize: 18,
                                                        letterSpacing: 1.3
                                                    }}>{this.state.endHours[(parseInt(v) + testv1).toString()]}</Text>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                        <Card
                                            style={[styles.fl1, styles.border6, {
                                                borderLeftColor: v === "12" ? "#f05" : "#fff",
                                                borderRightColor: v === "12" ? "#f05" : "#fff",
                                            }]}
                                        >
                                            <View style={styles.fCenter}>
                                                {
                                                    test.length ? (
                                                        <Card.Title
                                                            title={test[0]._subject}
                                                            subtitle={test[0]._room ? test[0]._room : "non définie"}
                                                        />
                                                    ) : (
                                                        <Card.Title/>
                                                    )
                                                }
                                            </View>
                                            {v === "12" &&
                                            <Text style={[styles.f19, styles.leSp, styles.lunchTime]}>PAUSE
                                                MIDI</Text>}
                                        </Card>
                                    </View>
                                )
                            } else {
                                Memory = true
                                return null
                            }
                        })
                    }
                </View>
            )
        };
        const {data} = this.state
        console.log("---------------------RENDER-------------------------");
        if (this.state.loading) {
            return (
                <GestureRecognizer
                    onSwipeLeft={() => {
                        console.log("==> Left")
                        let date = this.state.selectedDate
                        date.setDate(date.getDate() + 1)
                        this.onChange(null, date)
                    }}
                    onSwipeRight={() => {
                        console.log("==> Right")
                        let date = this.state.selectedDate
                        date.setDate(date.getDate() - 1)
                        this.onChange(null, date)
                    }}

                    style={styles.fGesture}
                >
                    <View style={styles.TitleContainer}>
                        <Text
                            style={styles.TitleText}
                        >
                            Cours
                        </Text>
                        <View style={styles.fEnd}>
                            <View style={styles.switchDay}>
                                <IconButton
                                    icon="chevron-left"
                                    onPress={() => {
                                        let date = this.state.selectedDate
                                        date.setDate(date.getDate() - 1)
                                        this.onChange(null, date)
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={this.showDatepicker}
                                >
                                    <Text
                                        style={styles.f24}
                                    >
                                        {this.state.dayNames[this.state.selectedDate.getDay()]} {this.state.selectedDate.getDate()} {this.state.monthNamesShort[(parseInt(this.state.selectedDate.getMonth()))]}
                                    </Text>
                                </TouchableOpacity>
                                <IconButton
                                    icon="chevron-right"
                                    onPress={() => {
                                        let date = this.state.selectedDate
                                        date.setDate(date.getDate() + 1)
                                        this.onChange(null, date)
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    {((data.length) ?
                            (
                                <ScrollView style={styles.fl1}>
                                    {
                                        //data.map((item, index) => {
                                        //    return renderItem(item, index)
                                        //})
                                        renderItemV2(data)
                                    }
                                </ScrollView>
                            ) : (

                                <View style={styles.nothings}>
                                    <Text style={styles.f25}>Aucun cours marqué pour ce jour</Text>
                                </View>
                            )
                    )}
                    {this.state.show &&
                    (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={this.state.selectedDate}
                            mode={this.state.mode}
                            is24Hour={true}
                            display="default"
                            onChange={this.onChange}
                        />
                    )
                    }

                </GestureRecognizer>

            )
        } else {
            return (
                <View
                    style={styles.fCenter}
                >
                    <ActivityIndicator size="large"/>
                </View>
            )
        }
    };
};

const styles = StyleSheet.create({
    fl1: {
        flex: 1
    },
    fCenter: {
        flex: 1,
        justifyContent: "center"
    },
    fGesture: {
        flex: 1,
        backgroundColor: "#EEF2F4"
    },
    TitleContainer: {
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    TitleText: {
        fontSize: 75,
        color: "#DE3C44",
        marginLeft: 10
    },
    fEnd: {
        justifyContent: 'flex-end'
    },
    switchDay: {
        flexDirection: "row",
        alignItems: "center"
    },
    f24: {
        fontSize: 24
    },
    f25: {
        fontSize: 25
    },
    nothings: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: "#f0f0f0",
    },
    cardContainer: {
        marginLeft: 10,
        marginRight: 10,
        flexDirection: "row",
        alignSelf: "flex-start",
    },
    cardMain: {
        marginRight: 2,
        minWidth: 72,
    },
    spBtw: {
        justifyContent: "space-between"
    },
    f18: {
        fontSize: 18
    },
    f19: {
        fontSize: 19
    },
    leSp: {
        letterSpacing: 1.3
    },
    border6: {
        borderRightWidth: 6,
        borderLeftWidth: 6
    },
    lunchTime: {
        position: "absolute",
        bottom: 5,
        right: 5
    }
});
