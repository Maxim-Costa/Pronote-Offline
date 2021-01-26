import * as React from 'react';

import pronote from 'pronote-api';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import GlobalFont from 'react-native-global-font'
import {Text} from 'react-native';
import {useFonts} from 'expo-font';
import * as SQLite from "expo-sqlite";
import Login from './Login';
import Home from './Time';
import homeworks from './homeworks'
import marks from './marks'

import {SvgCss} from 'react-native-svg';

const HeiWid = 30;
const TimetableSVG = '<svg viewBox="0 0 1024 1024"><path d="M657,245.2V192h-54v54l-216-0.8V192h-54.1v53.2H171V840h648V245.2H657z M333,300v54h54v-54h216v54h54v-54h108v135H225V300 H333z M225,786V489h540v297H225z"/></svg>';
const HomeworksSVG = '<svg viewBox="0 0 1024 1024"><path d="M715,190.4H283v513h108c46.7,0,95.5,23.9,95.9,24.2l12.1,6l12-6c0.5-0.2,49.3-24.2,96-24.2h108V190.4z M607,649.4 c-44.3,0-87.6,15.8-108,24.4c-20.4-8.6-63.7-24.4-108-24.4h-54v-405h324v405H607z"/><path d="M742,271.4v54h27v428.9H607c-44.3,0-87.6,15.8-108,24.4c-20.4-8.6-63.7-24.4-108-24.4H229V325.4h27v-54h-81v540h216 c46.7,0,95.5,23.9,95.9,24.2l12.1,6l12-6c0.5-0.2,49.3-24.2,96-24.2h216v-540L742,271.4z"/></svg>';
const MarksSVG = '<svg viewBox="0 0 1024 1024"><path d="M611,607.8h-54L449,348.6L341,607.8h-54v54h31.5l-29.4,70.6l49.9,20.8l38.1-91.4h144l38.1,91.4l49.8-20.8l-29.5-70.6H611 V607.8z M399.5,607.8L449,489l49.5,118.8H399.5z"/> <path d="M827,840H179V192h648V840z M233,786h540V246H233V786z"/><polygon points="719,354 665,354 665,300 611,300 611,354 557,354 557,408 611,408 611,462 665,462 665,408 719,408 \t"/></svg>';
const FilesSVG = '<svg viewBox="0 0 1024 1024"><polygon points="507.1,237.3 819,393.2 843.2,345 507.1,176.9 171,345 195.1,393.2 \t"/> <path d="M786.1,423.1h-54v378h-126v-261h-198v261h-126v-378h-54v378h-45v54h648v-54h-45V423.1z M462.1,594.1h90v207h-90V594.1z"/></svg>';

const db = SQLite.openDatabase("db.db");


console.log("\n\n\n\n\n\n---------------------------JS START----------------------------")


const Tab = createMaterialBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator
            style={{
                marginTop: 25,
            }}
            barStyle={{backgroundColor: '#EEF2F4'}}
            screenOptions={({route}) => ({
                tabBarIcon: ({focused}) => {
                    let iconName;
                    let color;

                    if (route.name === 'Calendar') {
                        return <SvgCss xml={TimetableSVG} width={HeiWid} height={HeiWid}
                                       fill={focused ? '#2B2D40' : '#8F99AC'}/>


                    } else if (route.name === 'Devoir') {
                        return <SvgCss xml={HomeworksSVG} width={HeiWid} height={HeiWid}
                                       fill={focused ? '#2B2D40' : '#8F99AC'}/>


                    } else if (route.name === 'Note') {
                        return <SvgCss xml={MarksSVG} width={HeiWid} height={HeiWid}
                                       fill={focused ? '#2B2D40' : '#8F99AC'}/>


                    } else if (route.name === 'Resource') {
                        return <SvgCss xml={FilesSVG} width={HeiWid} height={HeiWid}
                                       fill={focused ? '#2B2D40' : '#8F99AC'}/>

                    }
                },
            })}
        >
            <Tab.Screen
                name="Calendar"
                component={Home}
                options={{
                    tabBarLabel: 'Cours',
                }}
            />
            <Tab.Screen
                name="Devoir"
                component={homeworks}
                options={{
                    tabBarLabel: 'Devoir',
                }}
            />

            <Tab.Screen
                name="Note"
                component={marks}
                options={{
                    tabBarLabel: 'Note',
                }}
            />

            <Tab.Screen
                name="Resource"
                component={Resource}
                options={{
                    tabBarLabel: 'Resource',
                }}
            />

        </Tab.Navigator>
    );
}


function Resource() {
    return (
        <Text>Resource</Text>
    )
}


const Stack = createStackNavigator();

function App() {
    const [loaded] = useFonts({
        Accid: require('./assets/fonts/accid___.ttf'),
        DaFontH: require('./assets/fonts/HWYGEXPD.ttf')
    });


    if (!loaded) {
        return null;
    }

    GlobalFont.applyGlobal("Accid")
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Algo">

                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{
                        headerShown: false
                    }}
                />

                <Stack.Screen
                    name="Home"
                    component={MyTabs}
                    options={{
                        headerShown: false
                    }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );

}


export default App;
