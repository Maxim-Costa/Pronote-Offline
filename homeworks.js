import * as React from 'react';
import {ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Card, IconButton, Paragraph, Title} from 'react-native-paper';
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
            currentDate: this.getTrueDate(new Date()),
            selectedDate: new Date(),
            mode: 'date',
            show: false,
            data: {},
            datav2: {},
            isConnected: false,
            modalShow: false,
            files: []

        }

    }

    onChange = (event, selectedDate) => {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM homeworks WHERE _date = ?", [this.getTrueDate(selectedDate)], (_, rows) => {
                    let data = {}
                    data = rows.rows._array
                    this.setState({
                        show: Platform.OS === 'ios',
                        data: data,
                        selectedDate: selectedDate || this.state.selectedDate,
                        loading: true
                    })
                }, (_, e) => {
                    console.log("error ", e)
                }
            )
        })
    }

    getFile(id) {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM files WHERE _id_work = ?", [id], (_, rows) => {
                this.setState({modalShow: true, files: rows.rows._array})
            }, (_, e) => {
                console.log("error : ", e)
            })
        })
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
            return (
                <View>
                    {
                        this.state.data.map((v, idx) => {
                            const {_id, _description, _htmlDescription, _subject, _givenAt, _for, _done, _color, _date, _file} = v;

                            return (
                                <View
                                    key={v + idx.toString()}
                                    style={[styles.cardContainer, {
                                        marginBottom: idx === (this.state.data.length - 1) ? 10 : 4,
                                        marginTop: idx === 0 ? 20 : 0,
                                    }]}
                                >
                                    <Card
                                        style={[styles.fl1]}
                                    >
                                        <View style={styles.fCenter}>
                                            <Card.Title
                                                title={_subject}
                                                subtitle={"fait : " + (parseInt(_done) ? "oui" : "non")}
                                            />
                                            <Card.Content>
                                                <Paragraph>{_description}</Paragraph>
                                            </Card.Content>
                                            <View
                                                style={{flex: 1, alignItems: "flex-end"}}
                                            >
                                                {parseInt(_file) ? (
                                                    <IconButton
                                                        icon="file"
                                                        size={20}
                                                        onPress={() => this.getFile(_id)}
                                                    />
                                                ) : <View style={{marginBottom: 10}}></View>}
                                            </View>
                                        </View>
                                    </Card>
                                </View>
                            )
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
                            Devoirs
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
                                    <Text style={styles.f25}>Aucun devoirs marqué pour ce jour</Text>
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
                    <Modal isVisible={this.state.modalShow} onBackdropPress={() => this.setState({modalShow: false})}>
                        <View style={{
                            backgroundColor: "#fff",
                            alignSelf: 'center',
                            justifyContent: 'center',
                            padding: 16,
                            borderRadius: 5
                        }}
                        >
                            <Title style={{marginBottom: 10}}>Nombre de documents : {this.state.files.length}</Title>
                            {this.state.files.map((item) => {
                                return (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(item._url)}
                                        key={item._name + item._id_work}
                                        style={{
                                            padding: 2,
                                            marginTop: 5,
                                            marginBottom: 5
                                        }}
                                    >
                                        <Paragraph>{item._name}</Paragraph>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </Modal>
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
