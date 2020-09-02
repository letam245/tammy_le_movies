import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {SafeAreaView, FlatList, StatusBar, Text} from 'react-native';
import {useValue} from 'react-native-redash';

import Modal from '@components/Modal';
import Movie from '@components/Movie';

import type MovieType from '@app/types/Movie';
import type PositionType from '@app/types/Position';

interface ModalState {
    movie: MovieType;
    position: PositionType;
}

type StartParamList = {
    Start: {
        movies: Array<MovieType>;
    };
};

type StartRoute = RouteProp<StartParamList, 'Start'>;

const Start = () => {
    const route = useRoute<StartRoute>();
    const {movies} = route.params;
    const activeMovieId = useValue<number>(-1);
    const [modal, setModal] = useState<ModalState | null>(null);

    const open = (index: number, movie: MovieType, position: PositionType) => {
        activeMovieId.setValue(index);
        setModal({movie, position});
    };

    const close = () => {
        activeMovieId.setValue(-1);
        setModal(null);
    };

    console.log('movies', movies)
    const renderMoviews = (movie: MovieType, index: number) => {
        return (
            (movie.name || movie.poster || movie.description) &&
            <Movie
                activeMovieId={activeMovieId}
                index={index}
                movie={movie}
                open={open}
            />
        )
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                {movies && movies.length > 0 &&
                    <FlatList
                        initialNumToRender={5} 
                        onEndReachedThreshold={5}
                        keyExtractor={item => `${item.id} ${item.name}`}
                        data={movies}
                        renderItem={({item, index}) => renderMoviews(item, index)}
                    />
                }
                {movies && movies.length === 0 && <Text style={{textAlign: 'center'}}>No moview available</Text>}
                {modal !== null && <Modal {...modal} close={close}/>}
            </SafeAreaView>
        </>
    );
};

export default Start;
