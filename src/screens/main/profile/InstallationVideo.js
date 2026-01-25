import { useCallback, useEffect } from 'react'
import { FlatList, Linking, RefreshControl, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'


import MainView from '../../../components/MainView'
import VideoCard from '../../../components/card/VideoCard'
import Loader from '../../../components/common/loader/Loader'
import Nodata from '../../../components/common/nodata/Nodata'
import Seperator from '../../../components/common/seperator/Seperator'
import CustomHeader from '../../../components/header/CustomHeader'
import { SIZES } from '../../../constants'
import { getVideosThunk } from '../../../redux/slices/main/installationSlice'
import { showToast } from '../../../utils/ToastAndroid'


const InstallationVideo = () => {


    const dispatch = useDispatch()
    const { loading, refreshing, videosData } = useSelector(state => state.installation)
    // console.log('Videos data ', videosData, loading, refreshing)


    const fetchData = ({ isRefresh = false }) => {
        dispatch(getVideosThunk({ isRefresh }))
    }
    useEffect(() => {
        fetchData({})
    }, [])
    const onRefresh = useCallback(() => {
        fetchData({ isRefresh: true })
    }, [])


    const handleVideoPress = async (url) => {
        if (!url) {
            showToast('No url provided')
            return;
        }

        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        const appUrl = `vnd.youtube://${videoId}`;
        const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

        try {
            const canOpen = await Linking.canOpenURL(appUrl);
            await Linking.openURL(canOpen ? appUrl : webUrl);
        } catch {
            showToast('Cannot open YouTube link');
        }
    };



    return (
        <MainView transparent={false}>
            <CustomHeader title={'Installation Video'} back />


            {loading
                ?
                <Loader />
                :
                <FlatList
                    data={videosData?.data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <VideoCard item={item} onPress={() => handleVideoPress(item?.youtubeLink)} />}
                    contentContainerStyle={videosData?.data.length > 0 ? styles.contentContainerStyle : styles.emptyContainerStyle}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ItemSeparatorComponent={<Seperator height={SIZES.height * 0.03} />}
                    ListEmptyComponent={<Nodata />}
                />
            }
        </MainView>
    )
}

export default InstallationVideo


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: SIZES.width * 0.05
    },
    contentContainerStyle: {
        paddingHorizontal: SIZES.width * 0.05
    },
    emptyContainerStyle: {
        flex: 1
    }

})