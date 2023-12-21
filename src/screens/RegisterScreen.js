import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/core';
import { auth, db } from '../../firebase';
import { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context"
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; 
import { Formik } from 'formik';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  ImageBackground,
  Alert,
} from 'react-native';
import { signUpInitialValue, signUpSchema } from '../components/validations/RegisterValidation';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSignUp = async (values) => {
    const { firstName, lastName ,email, password } = values;

    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
      })

      await sendEmailVerification(user);
      Alert.alert("Check your email for verification!");
      navigation.replace('Login');
    } catch (error) {
      let errorMessage = 'An error occurred during sign-up.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email' || error.code === 'auth/weak-password') {
        errorMessage = 'Invalid email or weak password.';
      }

      Alert.alert('Sign-Up Error', errorMessage);
      }
  }

  return (
      <SafeAreaView style={RegisterStyles.container}>
        <ImageBackground source={require('../../assets/register-bg.png')} resizeMode="cover" style={RegisterStyles.imageBackground}>
          <Text style={RegisterStyles.title}>Create Account</Text>
            <Text style={RegisterStyles.subTitle}>Sign up now to gain access in our app!</Text>
              <Formik
                initialValues={signUpInitialValue}
                validationSchema={signUpSchema}
                onSubmit={handleSignUp}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) =>  (
                <View>
                <Text>First Name</Text>
                <TextInput
                  style={RegisterStyles.input}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  placeholder='John'
                />
                {errors.firstName && touched.firstName ? (
                  <Text style={RegisterStyles.errorText}>{errors.firstName}</Text>
                  ) : null}
                <Text>Last Name</Text>
                <TextInput
                  style={RegisterStyles.input}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                  placeholder='Doe'
                />
                {errors.lastName && touched.lastName ? (
                  <Text style={RegisterStyles.errorText}>{errors.lastName}</Text>
                  ) : null}
                <Text>Email</Text>
                <TextInput
                  style={RegisterStyles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder='Enter your email'
                />
                {errors.email && touched.email ? (
                  <Text style={RegisterStyles.errorText}>{errors.email}</Text>
                  ) : null}
                <Text>Password</Text>
                <View style={RegisterStyles.passwordInput}>
                  <TextInput
                    style={{flex: 1}}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    placeholder='Password must be atleast 6 characters'
                    secureTextEntry={!passwordVisible}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={passwordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color='gray'
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password ? (
                  <Text style={RegisterStyles.errorText}>{errors.password}</Text>
                  ) : null}
                <Text>Confirm Password</Text>
                <View style={RegisterStyles.passwordInput}>
                  <TextInput
                    style={{flex: 1}}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                    placeholder='Password must match'
                    secureTextEntry={!confirmPasswordVisible}
                  />
                  <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                    <Ionicons
                      name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color='gray'
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && touched.confirmPassword ? (
                  <Text style={RegisterStyles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                
                <TouchableOpacity style={RegisterStyles.signUpBtn} onPress={handleSubmit}>
                  <Text style={RegisterStyles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
          )}
        </Formik>  
        </ImageBackground>
    </SafeAreaView>
  );
};

const RegisterStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex:1,
    padding:20,
  },
  containerCenter: {
    marginTop:20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginImage: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color:  '#09814A',
    marginVertical: 8,
  },
  subTitle: {
    fontSize: 18,
    marginBottom:20,
    color: '707070'
  },
  input: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom:12,
    borderColor: 'gray',
    borderWidth: 1,
  },
  passwordInput: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
    borderRadius: 8,
    padding: 12,
    marginBottom:12
  },
  signUpBtn: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09814A',
    borderRadius: 12
  },
  signUpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 15,
    marginLeft: 3
  },
  loginText: {
    color: '#09814A',
    marginLeft: 3
  },
  errorText: {
    color: "#FF3D3D"
  }
});