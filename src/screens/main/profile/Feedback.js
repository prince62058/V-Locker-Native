import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MainView from '../../../components/MainView';
import FeedbackModal from '../../../components/Modal/FeedbackModal';
import SubmitButton from '../../../components/common/button/SubmitButton';
import CustomeInput from '../../../components/common/input/CustomeInput';
import CustomHeader from '../../../components/header/CustomHeader';
import { COLORS, FONTS, SIZES } from '../../../constants';
import { showToast } from '../../../utils/ToastAndroid';
import { fontSize } from '../../../utils/fontSize';
import {
  createFeedbackThunk,
  getAllFeedbackThunk,
} from '../../../redux/slices/main/feedbackSlice';

const Feedback = () => {
  const dispatch = useDispatch();
  const { feedbackData, loading } = useSelector(state => state.feedback);
  console.log('feedback data', feedbackData);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    feedback: '',
  });
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (value?.length > 0) handleErrorChange(key, null);
  };

  const [errors, setError] = useState({});
  const handleErrorChange = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (form.feedback.trim() === '') {
      showToast('Feedback text is required');
      return false;
    }
    return true;
  };

  const handleCreatePress = async () => {
    if (!validate()) return;
    try {
      const response = await dispatch(createFeedbackThunk(form));
      if (createFeedbackThunk.fulfilled.match(response)) {
        showToast('Feedback submitted successfully!');
        setForm({ feedback: '' }); // Reset form
        handleModalToggle();
      }
    } catch (error) {
      showToast('Failed to submit feedback. Please try again.');
    }
  };

  const handleModalToggle = () => {
    setModal(!modal);
  };

  useEffect(() => {
    // dispatch(getAllFeedbackThunk())
  }, []);

  const [keyboardOffset, setKeyboardOffset] = useState(0);
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOffset(Platform.OS === 'android' ? 0 : 90);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(-40);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <MainView transparent={false}>
      <CustomHeader title="Feedback" back />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
        >
          <View style={styles.container}>
            <CustomeInput
              label="Feedback"
              placeholder="Tell us what you think..."
              placeholderTextColor={COLORS.borderLight}
              value={form.feedback}
              onChangeText={text => handleChange('feedback', text)}
              error={errors.feedback}
              multiline
            />
          </View>

          <SubmitButton
            title="Submit Feedback"
            onPress={handleCreatePress}
            mainStyle={styles.button}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal visible={modal} onRequestClose={handleModalToggle} />
    </MainView>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: SIZES.width * 0.05,
  },
  title: {
    fontSize: fontSize(30),
    fontFamily: FONTS.medium,
    marginBottom: SIZES.height * 0.03,
  },
  desc: {
    fontSize: fontSize(15),
    width: SIZES.width * 0.8,
    marginBottom: SIZES.height * 0.05,
  },
  seperator: {
    height: SIZES.height * 0.03,
  },
  button: {
    marginBottom: SIZES.height * 0.01,
    marginHorizontal: 'auto',
  },
});
