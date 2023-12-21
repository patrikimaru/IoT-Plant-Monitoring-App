import { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebase';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  Alert,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';


export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const openForgotPasswordModal = () => {
    setModalVisible(true);
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        Alert.alert('You have successfully logged in');
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Please verify your email before logging in.');
        await sendEmailVerification(user);
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  
  return (
    <SafeAreaView style={LoginStyles.container}>
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/login-bg.png')}
        style={LoginStyles.imageBackground}>
        <View>
          <Text style={LoginStyles.title}>TerraTrend</Text>
          <Text style={LoginStyles.subTitle}>Login to Continue</Text>
        </View>
        <View>
          <TextInput
            style={LoginStyles.input}
            value={email}
            placeholder="Enter your email"
            onChangeText={(text) => setEmail(text)}
          />
          <View style={LoginStyles.passwordInput}>
            <TextInput
              style={{ flex: 1 }}
              value={password}
              secureTextEntry={!passwordVisible}
              placeholder="Enter your password"
              onChangeText={(text) => setPassword(text)}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Ionicons
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={openForgotPasswordModal}>
            <Text style={LoginStyles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={LoginStyles.loginBtn} onPress={handleLogin}>
            <Text style={LoginStyles.loginText}>Login</Text>
          </TouchableOpacity>
          <View style={LoginStyles.containerCenter}>
            <Text style={{ color: '#707070' }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.push('Register')}>
              <Text style={LoginStyles.signUpText}>Sign up now!</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ForgotPasswordModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-around',
  },
  containerCenter: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#09814A',
  },
  subTitle: {
    fontSize: 18,
    color: '#707070',
  },
  input: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 15,
    borderRadius: 8,
    padding: 12,
  },
  loginBtn: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09814A',
    borderRadius: 12,
  },
  loginText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 15,
  },
  signUpText: {
    marginLeft: 3,
    color: '#fff',
  },
  forgotText: {
    color: '#fff',
    textAlign: 'right',
    marginLeft: 3,
    marginTop: 8,
  },
});
