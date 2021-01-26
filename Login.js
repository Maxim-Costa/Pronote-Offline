import * as React from "react";
import NetInfo from "@react-native-community/netinfo";
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as SQLite from "expo-sqlite";
import {Switch, TextInput} from "react-native-paper";

const db = SQLite.openDatabase("db.db");


export default class algo extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        isConnected: false,
        username: "",
        password: "",
        url: "https://0340038g.index-education.net/pronote/",
        loading: false,
        urlShow: false,
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort: ['Janv.', 'Févr.', 'Mars ', 'Avril', 'Mai  ', 'Juin ', 'Juil. ', 'Août ', 'Sept.', 'Oct. ', 'Nov. ', 'Déc. '],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
        today: 'Aujourd\'hui',
        selectedDate: new Date(),
        haveData: false,
        Dark: false
    }

    async LoggedSuccess(loginInfo) {
        let userInfo = await this.LoginTo(loginInfo.username, loginInfo.password, loginInfo.url)

        if (userInfo.success) {

            this.uploadData(userInfo)

        } else {
            this.LoggedFaild()
        }
    }

    Log() {
        console.log('=> Log')
        this.setState({loading: false})
        const {username, password, url} = this.state;
        db.transaction(
            tx => {
                tx.executeSql(
                    "INSERT OR REPLACE INTO logins (id, username, password, url, _date) VALUES (0, ?, ?, ?, ?)",
                    [username, password, url, new Date().toDateString()],
                    () => this.main(),
                    () => console.log("ko")
                );
            },
        );
    }

    async LoggedSuccessOffline(loginInfo) {

        if (loginInfo && loginInfo.username) {
            console.log("======> succes go home wihout internet, last connexion : ", new Date(loginInfo._date));
            alert("la dernier fois que les info ont été mis a jour : " + this.getTrueDate(new Date(loginInfo._date)));
            this.props.navigation.replace('Home')
        } else {
            //alert("Internete error: vous n'avez actuellement enregistrer aucune info.")
            console.log("======> Internete error: vous n'avez actuellement enregistrer aucune info.")
            this.setState({loading: true, error: "identifiant invalide"})
        }
    }

    LoggedFaild() {
        alert("Les identifiant ne sont pas ou plus valide.")
        console.log("============> faild")
        this.setState({loading: true, error: "identifiant invalide"})
    }

    async main() {
        console.log("-------------------------main-------------------------")
        this.setState({loading: false})
        await NetInfo.fetch().then(state => {
            console.log("====> Is connected?", state.isConnected);
            this.state.isConnected = state.isConnected
        });

        if (this.state.isConnected) {

            this.getLogged("online")


        } else {

            this.getLogged("offline")


        }

    }

    getLogged(status) {
        db.transaction(tx => {

            tx.executeSql("" +
                "create table if not exists logins (id INT NOT NULL PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), url VARCHAR(255), _date VARCHAR(255));",
                [],
                () => {
                    console.log("==========> CREATE success logins")
                }, () => {
                    console.log("==========> CREATE error logins")
                });

            tx.executeSql(
                "SELECT * FROM logins WHERE id = ?",
                [0],
                (_, rows) => {

                    console.log(rows)

                    if (rows.rows.length) {

                        this.state.haveData = true

                        if (status === "online") {
                            this.LoggedSuccess(rows.rows._array[0])
                        } else {
                            this.LoggedSuccessOffline(rows.rows._array[0])
                        }

                    } else {

                        this.LoggedFaild()

                    }

                },
                (_, error) => {

                    this.LoggedFaild()

                }
            )
        });
    }

    async LoginTo(username, password, url) {
        console.log("--------------------------------async Login-----------------------------------");
        console.log("======> download start")
        let resp = await fetch('https://api.e-tp.hosterfy.fr/Pronote?username=' + username + '&password=' + password + '&url=' + url, {
            method: 'POST',
            mode: 'cors'
        })
        let respJson = await resp.json();
        console.log("======> download finish")
        return respJson
    }

    componentDidMount() {




        console.log("\n\n\n\n--------------------------MOUNT--LOGINS-------------------------")
        console.log("==> start")
        this.main()
    }

    getTrueDate(date) {
        return date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1 < 10 ? "0" + (parseInt(date.getMonth()) + 1).toString() : (parseInt(date.getMonth()) + 1).toString()) + '-' + (parseInt(date.getDate()) < 10 ? "0" + date.getDate() : date.getDate())
    }


    async uploadData(data) {
        console.log("---------------------uploadData-------------------------")
        db.transaction(
            tx => {
                tx.executeSql("" +
                    "DROP TABLE IF EXISTS timetables;",
                    [],
                    () => {
                        console.log("==========> DROP success timetables")
                    }, () => {
                        console.log("==========> DROP error timetables")
                    });

                tx.executeSql("" +
                    "DROP TABLE IF EXISTS notes;",
                    [],
                    () => {
                        console.log("==========> DROP success notes")
                    }, () => {
                        console.log("==========> DROP error notes")
                    });
                tx.executeSql("" +

                    "DROP TABLE IF EXISTS homeworks;",
                    [],
                    () => {
                        console.log("==========> DROP success homeworks")
                    }, () => {
                        console.log("==========> DROP error homeworks")
                    });
                tx.executeSql("" +
                    "DROP TABLE IF EXISTS files;",
                    [],
                    () => {
                        console.log("==========> DROP success files")
                    }, () => {
                        console.log("==========> DROP error files")
                    });

                tx.executeSql("" +
                    "CREATE TABLE notes(_id INT ,_matiere VARCHAR(255),_type VARCHAR(255), _title VARCHAR(255), _isAway FLOAT, _value FLOAT, _min FLOAT , _max FLOAT, _average FLOAT, _scale FLOAT, _coefficient FLOAT, _date VARCHAR(255));",
                    [],
                    () => {
                        console.log("==========> create success notes")
                    }, () => {
                        console.log("==========> create error notes")
                    })
                tx.executeSql("" +
                    "CREATE TABLE homeworks(_id INT ,_description TEXT, _htmlDescription TEXT, _subject VARCHAR(255), _givenAt VARCHAR(255), _for VARCHAR(255), _done VARCHAR(255), _color VARCHAR(255),_date VARCHAR(255),_file VARCHAR(255));",
                    [],
                    () => {
                        console.log("==========> create success homeworks")
                    }, () => {
                        console.log("==========> create error homeworks")
                    })
                tx.executeSql("" +
                    "CREATE TABLE timetables(_subject VARCHAR(255), _teacher VARCHAR(255), _room VARCHAR(255), _color VARCHAR(255), _from VARCHAR(255), _to VARCHAR(255), _date VARCHAR(255));",
                    [],
                    () => {
                        console.log("==========> create success timetables")
                    }, () => {
                        console.log("==========> create error timetables")
                    })
                tx.executeSql("" +
                    "CREATE TABLE files(_id_work INT,_name TEXT, _url TEXT)",
                    [],
                    () => {
                        console.log("==========> create success files")
                    }, () => {
                        console.log("==========> create error files")
                    })


                let _error = []

                data.timetable.map((item, index) => {
                    tx.executeSql(
                        "INSERT INTO timetables (_subject, _teacher, _room, _color, _from, _to, _date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [item.subject, item.teacher, item.room, item.color, item.from, item.to, this.getTrueDate(new Date(item.from))],
                        () => {
                            if (index == (data.timetable.length - 1)) {
                                if (!_error.length) {
                                    console.log("==========> upload SQLite success timetables")
                                } else {
                                    console.log("==========> upload SQLite error timetables", _error.length)
                                }
                            }
                        },
                        (_, e) => {
                            _error.push(e)

                            if (index == (Object.keys(data).length - 1)) {
                                console.log("==========> upload SQLite error timetables", _error.length)
                            }
                        }
                    )
                })

                _error = []
                data.homework.map((item, index) => {
                    tx.executeSql(
                        "INSERT INTO homeworks (_id,_description, _htmlDescription, _subject, _givenAt, _for, _done, _color, _date, _file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [index, item.description, item.htmlDescription, item.subject, item.givenAt, item.for, item.done, item.color, this.getTrueDate(new Date(item.for)), item.files.length ? "1" : "0"],
                        () => {
                            if (index == (data.homework.length - 1)) {
                                if (!_error.length) {
                                    console.log("==========> upload SQLite success homework")
                                } else {
                                    console.log("==========> upload SQLite error homework", _error.length)
                                }
                            }
                        },
                        (_, e) => {
                            _error.push(e)

                            if (index == (data.homework.length - 1)) {
                                console.log("==========> upload SQLite error homework", _error[0])
                            }
                        }
                    )
                    if (item.files.length) {
                        item.files.map((file, idx) => {
                            tx.executeSql(
                                "INSERT INTO files (_id_work, _name, _url) VALUES (?, ?, ?)",
                                [index, file.name, file.url], () => {
                                }, (_, e1) => {
                                    _error.push(e1)
                                }
                            )
                        })
                    }
                })

                /* ************************************************************************ */
                _error = []
                data.marks.subjects.map((v, index) => {
                    let mat = v.name
                    let color = v.color
                    let type = "mat"

                    v.marks.map((item, idx) => {
                        tx.executeSql(
                            "INSERT INTO notes (_id, _matiere ,_type , _title , _isAway , _value , _min  , _max , _average , _scale , _coefficient , _date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            [parseInt(index.toString() + idx.toString()) + 100, mat, type, item.title, item.isAway, item.value, item.min, item.max, item.average, item.scale, item.coefficient, item.date], () => {
                            }, (_, e) => {
                                _error.push(e)
                            }
                        )
                    })

                    tx.executeSql(
                        "INSERT INTO notes (_id, _matiere ,_type , _title , _isAway , _value , _min  , _max , _average , _scale , _coefficient , _date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [index + 1, mat, "tot", "TOTO", false, v.averages.student, v.averages.min, v.averages.max, v.averages.studentClass, 20, 1, ""], () => {
                        }, (_, e) => {
                            _error.push(e)
                        }
                    )

                })

                tx.executeSql(
                    "INSERT INTO notes (_id, _matiere ,_type , _title , _isAway , _value , _min  , _max , _average , _scale , _coefficient , _date ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [0, "tot", "tot", "TOTO", false, data.marks.averages.student, 0, 20, data.marks.averages.studentClass, 20, 1, ""],
                    () => {
                        if (!_error.length) {
                            console.log("==========> upload SQLite success notes")
                        } else {
                            console.log("==========> upload SQLite error notes", _error.length)
                        }
                    }, (_, e) => {
                        _error.push(e)
                        console.log("==========> update SQLite error notes")
                    }
                )

                /* ************************************************************************ */

                tx.executeSql("" +
                    "UPDATE logins SET _date = ? WHERE id = ?",
                    [new Date().toDateString(), 0],
                    () => {
                        console.log("==========> update SQLite success logins")
                    },
                    () => {
                        console.log("==========> update SQLite error logins")

                    }
                )

            },
        );
        this.props.navigation.replace("Home")
    }

    onToggleSwitch = () => this.setState({Dark: !this.state.Dark});

    render() {
        if (!this.state.loading) {
            return (
                <View style={{
                    flex: 1,
                    justifyContent: "center"
                }}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        } else {
            return (
                <View style={[styles.fGesture, {marginTop: 25, backgroundColor: '#EEF2F4'}]}>
                    <View style={styles.TitleContainer}>
                        <Text
                            style={styles.TitleText}
                        >
                            Login
                        </Text>
                        <View style={styles.fEnd}>
                            <View style={styles.switchDay}>
                                <Text
                                    style={[styles.f24, {marginRight: 20}]}
                                >
                                    {this.state.dayNames[this.state.selectedDate.getDay()]} {this.state.selectedDate.getDate()} {this.state.monthNamesShort[(parseInt(this.state.selectedDate.getMonth()))]}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{padding: 20, flex: 1, marginTop: 50}}>
                        <TextInput
                            label="URL de l'établissement"
                            style={[styles.f18, styles.DaFontH, {marginBottom: 35}]}
                            mode="outlined"
                            value={this.state.url}
                            onChangeText={text => this.setState({url: text})}
                        />
                        <TextInput
                            label="Identifiant"
                            style={[styles.f18, styles.DaFontH, {marginBottom: 35}]}
                            mode="outlined"
                            value={this.state.username}
                            onChangeText={text => this.setState({username: text})}
                        />
                        <TextInput
                            label="Mot de passe"
                            style={[styles.f18, styles.DaFontH, {marginBottom: 35}]}
                            mode="outlined"
                            value={this.state.password}
                            onChangeText={text => this.setState({password: text})}
                            secureTextEntry={true}
                        />


                        <View style={[styles.switchDay, {marginBottom: 20}]}>
                            <Text style={[styles.f24, styles.DaFontH]}>Mode : </Text>
                            <View style={[styles.switchDay, styles.spBtw]}>
                                <Text style={[styles.f24, styles.DaFontH]}>clair</Text>
                                <Switch value={this.state.Dark} style={{marginRight: 25, marginLeft: 25}}
                                        onValueChange={this.onToggleSwitch}/>
                                <Text style={[styles.f24, styles.DaFontH]}>sombre</Text>
                            </View>
                        </View>
                        <View style={[styles.fl1, {justifyContent: "flex-end"}]}>
                            <TouchableOpacity
                                disabled={!(this.state.url && this.state.username && this.state.password)}
                                onPress={() => this.Log()}
                                style={{
                                    marginBottom: 10,
                                    marginLeft: 40,
                                    marginRight: 40,
                                    backgroundColor: "#8D99AE",
                                    height: 50,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 5
                                }}
                            >

                                <Text style={[styles.f18, styles.DaFontH]}>se connecter</Text>
                            </TouchableOpacity>

                            {this.state.haveData && <TouchableOpacity
                                style={{
                                    marginBottom: 10,
                                    marginLeft: 40,
                                    marginRight: 40,
                                    backgroundColor: "#50a7e7",
                                    height: 50,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 5
                                }} onPress={() => alert("vous allez voir des informations veille de x jours")}
                            >
                                <Text style={[styles.f15, styles.DaFontH]}>se reconnecter plus tard</Text>
                            </TouchableOpacity>}
                        </View>
                    </View>
                </View>
            );
        }
    }
}


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
    f16: {
        fontSize: 16
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
    },
    DaFontH: {
        fontFamily: 'DaFontH'
    }
});




