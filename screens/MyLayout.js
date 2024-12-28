import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import NavBar from './navs/NavBar';

const MyLayout = ({ children }) => {
  return (
    <>
      <StatusBar translucent={true}></StatusBar>
      <View style={styles.container}>
        <View style={styles.content}>{children}</View>
        <NavBar />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default MyLayout;
