import * as React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Card, Title} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
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
            selectedDate: new Date(),
            show: false,
            data: {},
            modalShow: false,
            noteData: {}
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

    getTrueNumber(nb) {
        return ((nb > 0) ? (nb % 1 ? nb.toFixed(2) : nb) : 0)
    }

    getHumanDate(date) {
        if (!date) {
            return ""
        }
        date = new Date(date)
        return (parseInt(date.getDate()) < 10 ? "0" + date.getDate() : date.getDate()) + "/" + (parseInt(date.getMonth()) + 1 < 10 ? "0" + (parseInt(date.getMonth()) + 1).toString() : (parseInt(date.getMonth()) + 1).toString()) + "/" + date.getFullYear()
    }

    getNoteInfo(id) {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM notes WHERE _id = ?", [id], (_, rows) => {
                console.log()
                this.setState({noteData: rows.rows._array[0], modalShow: true})

            })
        })
    }

    componentDidMount() {
        console.log("-----------------------MOUNT Home-------------------------")
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM notes", [], (_, rows) => {
                    let data = {}
                    rows.rows._array.map((v) => {
                        if (!data.hasOwnProperty(v._matiere)) {
                            data[v._matiere] = []
                        }
                        data[v._matiere].push(v)
                    })
                    this.setState({
                        data: data,
                        loading: true
                    })
                }, (_, e) => {
                    console.log("error ", e)
                }
            )
        })
    }


    render() {
        const renderItemV2 = (item) => {
            return (
                <View>
                    {
                        Object.keys(item).map((v, idx) => {

                            return (
                                <View key={v + idx.toString()} style={{marginTop: 20}}>
                                    <Title style={{marginLeft: 10}}>{v === "tot" ? "Moyenne général" : v}</Title>
                                    {
                                        item[v].map((itm, id) => {
                                            const {_id, _matiere, _type, _title, _isAway, _value, _min, _max, _average, _scale, _coefficient, _date} = itm;
                                            return (
                                                <View
                                                    key={v + idx.toString() + id.toString()}
                                                    style={[styles.cardContainer, {
                                                        marginBottom: 4,
                                                        marginTop: id === 0 ? 15 : 0,
                                                    }]}
                                                >
                                                    <Card
                                                        style={styles.fl1}
                                                    >
                                                        <TouchableOpacity
                                                            style={[styles.row]}
                                                            onPress={() => {
                                                                this.getNoteInfo(_id)

                                                            }}
                                                        >
                                                            <View
                                                                style={styles.fl1}
                                                            >
                                                                <Card.Title
                                                                    title={_title === "TOTO" ? "Moyenne" : this.getHumanDate(_date)}
                                                                    subtitle={_title !== "TOTO" && _title}

                                                                />
                                                            </View>
                                                            <View
                                                                style={[styles.fEndCenter]}
                                                            >
                                                                <Title>{this.getTrueNumber(_value) + "/" + this.getTrueNumber(_scale)}</Title>
                                                            </View>

                                                        </TouchableOpacity>
                                                    </Card>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            )
                        })
                    }
                </View>
            )
        };
        const {data, noteData} = this.state
        const scale = "/" + this.getTrueNumber(noteData._scale).toString()
        console.log("---------------------RENDER-------------------------");
        if (this.state.loading) {
            return (
                <View
                    style={styles.fGesture}
                >
                    <View style={styles.TitleContainer}>
                        <Text
                            style={styles.TitleText}
                        >
                            Notes
                        </Text>
                        <View style={styles.fEnd}>
                            <View style={styles.switchDay}>
                                <Text
                                    style={[styles.f24,{marginRight:20}]}
                                >
                                    {this.state.dayNames[this.state.selectedDate.getDay()]} {this.state.selectedDate.getDate()} {this.state.monthNamesShort[(parseInt(this.state.selectedDate.getMonth()))]}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {((Object.keys(data).length) ?
                            (
                                <ScrollView style={styles.fl1}>
                                    {
                                        renderItemV2(data)
                                    }
                                </ScrollView>
                            ) : (

                                <View style={styles.nothings}>
                                    <Text style={styles.f25}>Aucun Notes pour le moment</Text>
                                </View>
                            )
                    )}
                    <Modal isVisible={this.state.modalShow} onBackdropPress={() => this.setState({modalShow: false})}>
                        <View style={{
                            backgroundColor: "#fff",
                            alignSelf: 'center',
                            justifyContent: 'center',
                            padding: 16,
                            borderRadius: 5
                        }}
                        >
                            {noteData._title ? <Title style={{
                                marginBottom: 20,
                                textAlign: "center",
                                fontSize: 27
                            }}>{noteData._title}</Title> : null}

                            <View style={[styles.row, styles.spBtw]}>
                                <Title style={{marginBottom: 10, marginRight: 100}}>Coefficient</Title>
                                <Title>{this.getTrueNumber(noteData._coefficient)}</Title>
                            </View>
                            <View style={[styles.row, styles.spBtw]}>
                                <Title style={{marginBottom: 10}}>Note élève </Title>
                                <Title>{this.getTrueNumber(noteData._value)}{scale}</Title>
                            </View>
                            <View style={[styles.row, styles.spBtw]}>
                                <Title style={{marginBottom: 10}}>Moy. groupe </Title>
                                <Title>{this.getTrueNumber(noteData._average)}{scale}</Title>
                            </View>
                            <View style={[styles.row, styles.spBtw]}>
                                <Title style={{marginBottom: 10}}>Note + </Title>
                                <Title>{this.getTrueNumber(noteData._max)}{scale}</Title>
                            </View>
                            <View style={[styles.row, styles.spBtw]}>
                                <Title style={{marginBottom: 10}}>Note - </Title>
                                <Title>{this.getTrueNumber(noteData._min)}{scale}</Title>
                            </View>
                        </View>
                    </Modal>
                </View>

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
    fEndCenter: {
        justifyContent: 'center',
        alignItems: "flex-end",
        marginRight: 20
    },
    switchDay: {
        flexDirection: "row",
        alignItems: "center"
    },
    row: {
        flexDirection: "row",
    },
    column: {
        flexDirection: "column",
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
    f12: {
        fontSize: 12
    },
    f15: {
        fontSize: 15
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
    },
    mrBot: {
        marginBottom: 25
    }
});
