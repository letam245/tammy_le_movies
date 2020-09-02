/* eslint-disable react-native/no-inline-styles */
import React, { Fragment } from 'react';
import {ScrollView,StyleSheet,Text,useWindowDimensions,View, SectionList, FlatList, Platform} from 'react-native';
import Animated, {useCode, clockRunning} from 'react-native-reanimated';

import Poster from '@components/Poster';
import SwipeToClose from '@components/SwipeToClose';
import {createValue, spring, springBack} from '@utils/spring';

import type MovieType from '@app/types/Movie';
import type PositionType from '@app/types/Position';

const {
    Value,
    cond,
    greaterThan,
    greaterOrEq,
    sub,
    round,
    add,
    divide,
    call,
    eq,
} = Animated;

interface AnimatedStyle {
    position: 'absolute';
    width: Animated.Value<number>;
    height: Animated.Value<number>;
    left: Animated.Value<number>;
    top: Animated.Value<number>;
}

interface ModalProps {
    movie: MovieType;
    position: PositionType;
    close: () => void;
}

// Uppercases the first letter of each word in the title
function titleCase(value: string): string {
    // let title = '';
    // let shouldUpcase = true;
    // for (let i = 0; i < value.length; i++) {
    //     if (shouldUpcase) {
    //         title += value[i].toUpperCase();
    //         shouldUpcase = false;
    //     }
    //     if (value[i] === ' ') {
    //         shouldUpcase = true;
    //     }
    // }

    // return title;
    return value.toLocaleLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const Modal = ({movie, position, close}: ModalProps) => {
    const formattedSections = ([
        {
            title: 'Poster',
            data: [1]
        },
        {
          title: 'Content',
          data: [1]
        },
        {
          title: 'Reviews',
          data: [1]
        },
    ]);

    const dimensions = useWindowDimensions();
    const width = createValue(dimensions.width);
    const height = createValue(dimensions.height);
    const x = createValue(position.x);
    const y = createValue(position.y);
    const scale = createValue(1);
    const borderRadius = createValue(8);
    const opacity = createValue(0);
    const textOpacity = cond(
        greaterThan(
            width.value,
            add(
                position.width,
                divide(sub(dimensions.width, position.width), 2),
            ),
        ),
        1,
        0,
    );
    const translationY = new Value(0);
    const shouldClose = greaterOrEq(round(translationY), 100);
    const p: AnimatedStyle = {
        position: 'absolute',
        width: width.value,
        height: height.value,
        left: x.value,
        top: y.value,
    };

    useCode(
        () => [
            cond(
                shouldClose,
                [
                    springBack(width, dimensions.width, position.width),
                    springBack(height, dimensions.height, position.height),
                    springBack(x, 0, position.x),
                    springBack(y, 0, position.y),
                    springBack(borderRadius, 0, 8),
                    springBack(opacity, 1, 0),
                    springBack(scale, 0.75, 1),
                    cond(eq(clockRunning(scale.clock), 0), call([], close)),
                ],
                [
                    spring(width, position.width, dimensions.width),
                    spring(height, position.height, dimensions.height),
                    spring(x, position.x, 0),
                    spring(y, position.y, 0),
                    spring(borderRadius, 8, 0),
                    spring(opacity, 0, 1),
                ],
            ),
        ],
        [],
    );

    return (
        <Fragment>
        {/* <SwipeToClose y={translationY} opacity={opacity.value} {...{scale}}> */}
            <Text 
                style={{...styles.closeBtn, ...{paddingTop: Platform.OS !== 'android' ? dimensions.height * 0.065 : 25}}} 
                onPress={close}
            >
                X
            </Text>
            <Animated.View
                style={{
                    backgroundColor: 'white',
                    ...p,
                }}
            />
            <Animated.View
                style={{
                    opacity: textOpacity,
                    paddingTop: 0,
                    ...p,
                }}>
                {/* <View style={styles.content}>
                    <ScrollView>
                        <Text style={styles.paragraph}>
                            <Text style={{fontWeight: 'bold'}}>
                                {`${titleCase(movie.name)} `}
                            </Text>
                            <Text style={styles.paragraph}>
                                {movie.description}
                            </Text>
                        </Text>
                    </ScrollView>
                </View> */}
                <SectionList
                    sections={formattedSections}
                    keyExtractor={(item, index) => item + index}
                    renderSectionHeader={({section: {title}}) => (
                        <View style={title === 'Reviews'  ? {paddingHorizontal: 15} : {display:'none'}}>
                            <Text style={{...styles.paragraph, ...{fontWeight: 'bold'}}}>{title}</Text>
                        </View>
                    )}
                    renderItem={({item, index, section}) => {
                    let viewForSection = null;
                    if(section.title === 'Poster') {
                        viewForSection = 
                        (
                            <Animated.View style={{...p, height: position.height}}>
                                <Poster movie={movie} borderRadius={borderRadius.value} isModal={true} />
                            </Animated.View>
                        )
                    }
                    if (section.title === "Content") { 
                        viewForSection = 
                        (    
                            <View style={styles.content}>
                                <Text style={{...styles.paragraph, ...{paddingTop: position.height}}}>
                                    {movie.name &&
                                        <Text style={{fontWeight: 'bold'}}>
                                            {`${titleCase(movie.name)} `}
                                        </Text>
                                    }
                                    {movie.description &&
                                        <Text style={styles.paragraph}>
                                            {movie.description}
                                        </Text>
                                    }
                            
                                </Text>
                            </View>
                        )
                    }
                    if (section.title === "Reviews") {
                        viewForSection = 
                        (
                            <View style={{paddingHorizontal: 16}}>
                                {/* <View style={{borderTopWidth: 1, borderTopColor: 'gray'}}></View>
                                <Text style={{...styles.paragraph, ...{fontWeight: 'bold', marginTop: 20}}}>Reviews</Text> */}
                                <FlatList
                                    style={{marginBottom: 50}}
                                    keyExtractor={item => `${item.id} ${item.body}`}
                                    data={movie.reviews}
                                    renderItem={({item, index}) =><View style={{...styles.reviewsContainer, ...{borderTopWidth: index === 0 ? 0 : 1}}}><Text style={styles.reviews}>{index + 1}. {item.body}</Text></View>}
                                />
                            </View>
                        )
                    }
                        return viewForSection
                    }}
                />
            </Animated.View>
            {/* <Animated.View style={{...p, height: position.height}}>
                <Poster movie={movie} borderRadius={borderRadius.value} isModal={true}/>
            </Animated.View> */}
        {/* </SwipeToClose> */}
        </Fragment>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
        flex: 1,
    },
    paragraph: {
        fontSize: 24,
        marginBottom: 10,
    },
    reviewsContainer: {
        borderTopColor: 'gray',
    },
    reviews: {
        fontSize: 24,
        paddingVertical: 10,
    },
    closeBtn: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 30,
        zIndex: 999999999, 
        position: 'absolute',
        right: 20,
    }
});

export default Modal;
