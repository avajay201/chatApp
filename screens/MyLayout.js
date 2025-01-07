import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import NavBar from './navs/NavBar';

const MyLayout = ({ children }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" translucent={true} />

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {children}
        </View>
        <NavBar />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
});

export default MyLayout;
