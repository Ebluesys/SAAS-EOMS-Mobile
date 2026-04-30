import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Fonts } from '../themes/ThemePath';
import normalize from '../utils/helpers/normalize';

const RadioAction = (prop) => {
    return (
        <TouchableOpacity style={{
            borderColor: Colors.inputGreyBorder,
            borderWidth: 1,
            padding: normalize(10),
            width:prop.width,
            borderRadius: normalize(5),
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: prop?.marginBottom ? prop?.marginBottom : 0,
            marginTop: prop?.marginTop ? prop?.marginTop : 0

        }}
            onPress={() => {
                prop?.onPress && prop?.onPress()
            }}
        >

            <TouchableOpacity style={{
                borderWidth: 1,
                padding: normalize(3),
                borderRadius: normalize(20),
                marginRight: normalize(10),
                borderColor: prop?.isSelected ? Colors.button : Colors.lightBlue,
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center'
            }}
                onPress={() => {
                    prop?.onPress && prop?.onPress()
                }}
            >
                <View
                    style={{
                        padding: normalize(4),
                        borderRadius: normalize(20),
                        backgroundColor: prop?.isSelected ? Colors.button : 'transparent'
                    }}
                ></View>
            </TouchableOpacity>
            <Text style={{
                fontFamily: Fonts.MulishRegular,
                fontSize: normalize(13),
                color: Colors.darkblue
            }}>{prop?.text}</Text>

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({})

export default RadioAction;
